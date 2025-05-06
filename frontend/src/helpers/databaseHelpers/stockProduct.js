import dayjs from 'dayjs';
import axiosInstance from '../../services/api';
import utc from 'dayjs/plugin/utc';
import {isOnline} from '../networkHelper';
import {getBranchesOffline} from './getBranchesOffline';
dayjs.extend(utc);

export const checkCodeAvailable = async (db, productCode) => {
  const online = await isOnline();

  const verifyCode = await new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products WHERE code = ?',
          [productCode],
          (_, results) => resolve(results),
          (_, error) => reject(error),
        );
      });
    } catch (error) {
      console.log(error.response);
    }
  });

  if (verifyCode.rows.length > 0) {
    return Promise.reject({exists: true, source: 'local'});
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
  return new Promise((resolve, reject) => {
    const now = dayjs().format('YYYY-MM-DDTHH:mm:ss');

    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO
          products (code, name, description, created_at, updated_at, price, synced, image) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.code,
            product.name,
            product.description,
            now,
            now,
            product.price,
            0,
            product.image,
          ],
          (_, createdProduct) => {
            const productId = createdProduct.insertId;

            tx.executeSql(
              `INSERT INTO 
              stocks (product_id, branch_id, batch, quantity, created_at, updated_at, synced) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                productId,
                branchId,
                product.batch,
                product.quantity,
                now,
                now,
                0,
              ],
              () => resolve('Product created and saved locally'),
              (_, error) => {
                console.log('❌ Error saving stock: ', error);
                reject(error);
              },
            );
          },
          (_, error) => {
            console.log('❌ Error saving product: ', error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('❌ Error saving the product: ', error);
      reject(error);
    }
  });
};

export const deleteData = async db => {
  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `
          DELETE FROM products;
          `,
          [],
          (_, results) => {
            if (results.rowsAffected != 0) {
              console.log('✅ Products deleted ');
            }
            resolve(results);
          },
          (_, error) => {
            console.log('❌ Error deleting products ');
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('❌ Error deleting the product:', error.response);
    }
  });
};

export const showData = async db => {
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
          console.log(error);
          reject(error);
        },
      );
    });
  });
};

// const syncBranches = async db => {
//   const response = await axiosInstance.get('/branches');
//   const branches = response.data;
//   try {
//     for (const branch of branches) {
//       db.executeSql(
//         `
//             INSERT OR REPLACE INTO
//               branches (id, code, description)
//             VALUES (?,?,?)
//           `,
//         [branch.id, branch.name, branch.description],
//       );
//     }
//   } catch (error) {
//     console.log('❌ Error syncthing branches: ', error);
//   }
// };

export const fullSync = async db => {
  if (!(await isOnline())) return;

  // await syncBranches(db);
  await getBranchesOffline(db);
  //... other tables seeders
};



export const syncProducts = db => {
  return new Promise(async (resolve, reject) => {
    try {
      await fullSync(db);
    } catch (error) {
      console.log('❌ Error during full sync:', error.message);
      return reject(error.message);
    }

    db.transaction(tx => {
      tx.executeSql(
        `
          SELECT p.*, s.quantity, s.batch, s.branch_id, p.synced as products_synced, s.synced as stocks_synced
          FROM products p
          INNER JOIN stocks s ON P.id = s.product_id
          WHERE s.synced = 0;
        `,
        [],
        (_, results) => {
          const rows = results.rows;
          if (rows.length === 0) {
            console.log('✅ Nothing to synchronize');
            return resolve('no_changes');
          }

          const unsynced = [];
          for (let i = 0; i < rows.length; i++) {
            unsynced.push(rows.item(i));
          }

          const syncProduct = async product => {
            const branchId = product.branch_id;

            try {
              const formData = new FormData();

              formData.append('name', product.name);
              formData.append('description', product.description);
              formData.append('code', String(product.code));
              formData.append('quantity', String(product.quantity));
              formData.append('batch', String(product.batch));
              formData.append('price', String(product.price));
              formData.append('branchId', String(branchId));

              if (product.image) {
                formData.append('image', {
                  uri: product.image,
                  type: 'image/jpeg',
                  name: `image_${Date.now()}.jpg`,
                });
              }

              const response = await axiosInstance.post(
                `/branch/${branchId}/product/createOrUpdate`,
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
              );

              //Log stock
              const backendProductId = response.data.product.id;

              await axiosInstance.post(`/stock/${backendProductId}/log-add`, {
                branch_id: branchId,
                quantity: product.quantity,
              });

              await new Promise((resolveTx, rejectTx) => {
                db.transaction(tx => {
                  tx.executeSql(
                    `UPDATE products SET synced = 1 WHERE id = ?;`,
                    [product.id],
                    () => {
                      tx.executeSql(
                        `UPDATE stocks SET synced = 1 WHERE product_id = ? AND branch_id = ?;`,
                        [product.id, branchId],
                        resolveTx,
                        (_, error) => {
                          console.log('❌ Error updating stocks:', error);
                          reject(error);
                        },
                      );
                    },
                    (_, error) => {
                      console.log('❌ Error updating products:', error);
                      rejectTx(error);
                    },
                  );
                });
              });

              console.log(`✅ Product ${product.name} synchronized`);
            } catch (err) {
              console.log(
                '❌ Error syncthing the product:',
                err.response || err.message,
              );
              throw new Error('Error syncthing, check Wi-fi connection');
            }
          };

          (async () => {
            try {
              for (const product of unsynced) {
                await syncProduct(product);
              }

              //Products to be deleted:
              db.transaction(tx => {
                tx.executeSql(
                  `SELECT * FROM products WHERE synced = 1`,
                  [],
                  (_, res) => {
                    console.log('🔍 Products to be deleted:', res.rows.raw());
                  },
                );
              });

              db.transaction(tx => {
                tx.executeSql(
                  `DELETE FROM stocks WHERE synced = 1`,
                  [],
                  () => {
                    tx.executeSql(
                      `DELETE FROM products WHERE synced = 1`,
                      [],
                      () => {
                        console.log(
                          '✅ Synced products and stocks deleted locally',
                        );
                        resolve('synced');
                      },
                      (_, error) => {
                        console.log(
                          '❌ Error deleting synced products:',
                          error,
                        );
                        reject(error);
                      },
                    );
                  },
                  (_, error) => {
                    console.log('❌ Error deleting synced stocks:', error);
                    reject(error);
                  },
                );
              });
            } catch (error) {
              console.log('❌ Error during synchronization:', error.message);
              reject(error.message);
            }
          })();
        },
      );
    });
  });
};
