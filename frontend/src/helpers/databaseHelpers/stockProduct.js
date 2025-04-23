import dayjs from 'dayjs';
import axiosInstance from '../../services/api';
import utc from 'dayjs/plugin/utc';
import {isOnline} from '../networkHelper';
dayjs.extend(utc);

export const checkCodeAvailable = async (db, productCode) => {
  const online = await isOnline();

  const [verifyCode] = await db.executeSql(
    'SELECT * FROM products WHERE code = ?',
    [productCode],
  );

  if (verifyCode.rows.length > 0) {
    return reject({exists: true, source: 'local'});
  }

  if (online) {
    try {
      const response = await axiosInstance.get(
        `/products/check-code/${productCode}`,
      );

      if (response.data.exists) {
        return {exists: true, source: 'server'};
      }
    } catch (error) {
      console.log('Could not reach server to validate code: ', error);
    }
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM products WHERE code = ?`,
        [productCode],
        (_, results) => {
          if (results.rows.length > 0) {
            resolve({exists: true, source: 'local'});
          } else {
            resolve({exists: false});
          }
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

export const saveProductOffline = async (db, product, branchId) => {
  return new Promise(async (resolve, reject) => {
    const now = dayjs().format('YYYY-MM-DDTHH:mm:ss');

    try {
      const createdProduct = await db.executeSql(
        `INSERT INTO 
        products (code, name, description, created_at, updated_at, price, synced) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.code,
          product.name,
          product.description,
          now,
          now,
          product.price,
          0,
        ],
      );

      const productId = createdProduct[0].insertId;

      await db.executeSql(
        `INSERT INTO 
        stocks (product_id, branch_id, batch, quantity, created_at, updated_at, synced) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [productId, branchId, product.batch, product.quantity, now, now, 0],
      );

      resolve('Product created and saved locally');
    } catch (error) {
      console.log('❌ Error saving the product: ', error);
      reject(error);
    }
  });
};

export const deleteData = async db => {
  try {
    db.transaction(tx => {
      tx.executeSql(
        `
        DELETE FROM products;
        `,
        [],
      );
    });
    console.log('✅ Products deleted ');
  } catch (error) {
    console.log('❌ Error deleting the product:', error.response);
  }
};

export const showData = async db => {
  try {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          SELECT *, p.synced as products_synced, s.synced as stocks_synced FROM products p 
          INNER JOIN stocks s ON p.id = s.product_id;
          `,
          [],
          (_, results) => {
            const rows = results.rows;
            const products = [];

            for (let i = 0; i < rows.length; i++) {
              products.push(rows.item(i));
            }

            resolve(products);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    console.log('❌ Error fetching products:', error);
    reject(error);
    throw error;
  }
};

const syncBranches = async db => {
  try {
    const response = await axiosInstance.get('/branches');
    const branches = response.data;

    await db.transaction(tx => {
      for (const branch of branches) {
        tx.executeSql(
          `
            INSERT OR REPLACE INTO
              branches (id, code, description) 
            VALUES (?,?,?)
          `,
          [branch.id, branch.name, branch.description],
        );
      }
    });
    console.log('✅ Branches updated');
  } catch (error) {
    console.log('❌ Error syncthing branches: ', error);
  }
};

export const fullSync = async db => {
  if (!(await isOnline())) return;

  await syncBranches(db);
  //... other tables seeders
};

export const syncProducts = db => {
  return new Promise(async (resolve, reject) => {
    await fullSync(db);

    const [results] = await db.executeSql(
      `
      SELECT p.*, s.quantity, s.batch, s.branch_id
      FROM products p
      INNER JOIN stocks s ON P.id = s.product_id
      WHERE s.synced = 0;
    `,
    );

    const rows = results.rows;
    if (rows.length === 0) {
      console.log('✅ Nothing to synchronize');
      return resolve('no_changes');
    }

    const unsynced = [];
    for (let i = 0; i < rows.length; i++) {
      unsynced.push(rows.item(i));
    }

    for (const product of unsynced) {
      const branchId = product.branch_id;

      try {
        await db.executeSql(
          `SELECT p.*, s.quantity, s.batch, s.branch_id
             FROM products p 
             INNER JOIN stocks s ON p.id = s.product_id 
             WHERE s.synced = 0;`,
        );

        const rows = results.rows;
        const unsynced = [];

        if (rows.length === 0) {
          console.log('✅ No data to update');
          return resolve('no_changes');
        }

        for (let i = 0; i < rows.length; i++) {
          unsynced.push(rows.item(i));
        }

        for (const product of unsynced) {
          try {
            const response = await axiosInstance.post(
              `/branch/${branchId}/product/create`,
              {
                name: product.name,
                description: product.description,
                code: product.code,
                quantity: product.quantity,
                batch: product.batch,
                price: product.price,
                branchId: product.branch_id,
              },
            );

            //Log stock
            const backendProductId = response.data.product.id;
            try {
              const response = await axiosInstance.post(
                `/stock/${backendProductId}/log-add`,
                {
                  branch_id: branchId,
                  quantity: product.quantity,
                },
              );
            } catch (error) {
              console.log('❌ Log Error:', error.response);
              return reject('Error Logging, check Wi-fi connection');
            }

            if (response.status === 200 || response.status === 201) {
              await db.executeSql(
                `UPDATE products SET synced = 1 WHERE id = ?;`,
                [product.id],
              );

              await db.executeSql(
                `UPDATE stocks SET synced = 1 WHERE product_id = ? AND branch_id = ?;`,
                [product.id, branchId],
              );
            }
          } catch (err) {
            console.log(
              '❌ Error syncthing the product:',
              err.response || err.message,
            );
            return reject('Error syncthing, check Wi-fi connection');
          }
        }
        console.log(`✅ Product ${product.name} synchronized`);
        resolve('synced');
      } catch (err) {
        console.log('❌ Inespected error synchronizing: ', err);
        reject('Internal Error while synchronizing.');
      } finally {
        await db.executeSql(`DELETE FROM products WHERE synced = 1`);
        await db.executeSql(`DELETE FROM stocks WHERE synced = 1`);
      }
    }
  });
};
