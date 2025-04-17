import {useToast} from 'react-native-toast-notifications';
import {useDatabase} from '../../providers/DatabaseProvider';
import axiosInstance from '../../services/api';

let branchId = 0;

export const saveProductOffline = async (db, product, branchId) => {
  const now = new Date().toISOString();

  branchId = branchId;

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

    console.log('created');

    const insertId = createdProduct[0].insertId;

    await db.executeSql(
      `INSERT INTO 
        stocks (product_id, branch_id, batch, quantity, created_at, updated_at, synced) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [insertId, branchId, product.batch, product.quantity, now, now, 0],
    );

    console.log('Product saved locally');
  } catch (error) {
    console.log('Error saving the product: ', error);
  }
};

export const syncProducts = async db => {
  try {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM stocks WHERE synced = 0;`,
        [],
        async (_, results) => {
          const rows = results.rows;
          const unsynced = [];

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
                  branchId: branchId,
                },
              );

              if (response.status === 201 || response.status === 200) {
                db.transaction(tx2 => {
                  tx2.executeSql(
                    `UPDATE products SET synced = 1 WHERE id = ?;`,
                    [product.id],
                  );
                });

                console.log(`Product ${product.name} synchronized`);
              }
            } catch (err) {
              console.log('Error syncthing the product:', err.response);
            }
          }
        },
      );
    });
  } catch (err) {
    console.log('Error syncthing:', err);
  }
};
