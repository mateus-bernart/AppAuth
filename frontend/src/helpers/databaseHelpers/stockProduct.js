import dayjs from 'dayjs';
import axiosInstance from '../../services/api';
import utc from 'dayjs/plugin/utc';
import {isOnline} from '../networkHelper';
import {getBranchesOffline} from './getBranchesOffline';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

dayjs.extend(utc);

export const changeProductCodeOffline = async (db, productId, productCode) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
          UPDATE products SET code = ? WHERE id = ?
        `,
        [productCode, productId],
        (_, result) => {
          console.log('✅ Success updating product code');
          resolve(result);
        },
        (_, error) => {
          console.log('❌ Error updating the product code:', error);
          reject(error);
        },
      );

      tx.executeSql(
        `
          UPDATE products SET sync_error = NULL, error_codes = NULL WHERE id = ?
        `,
        [productId],
        (_, result) => {
          console.log('✅ Success updating sync_error and codes');
          resolve(result);
        },
        (_, error) => {
          console.log('❌ Error updating the sync_error and codes:', error);
          reject(error);
        },
      );
    });
  });
};

const checkLocalCode = (db, productCode) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products WHERE code = ?',
        [productCode],
        (_, results) => resolve(results),
        (_, error) => reject(error),
      );
    });
  });
};

export const checkCodeAvailable = async (db, productCode) => {
  const online = await isOnline();

  if (!online) {
    const verifyCode = await checkLocalCode(db, productCode);
    if (verifyCode.rows.length > 0) {
      return {exists: true, source: 'local'};
    }
  } else {
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

  return {exists: false};
};

export const addImageOffline = async (db, productId, image) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
          UPDATE products SET image = ? WHERE id = ?
        `,
        [image, productId],
        (_, result) => {
          console.log('✅ Image updated successfully');
          resolve(result);
        },
        (_, error) => {
          console.log('❌ Error updating image:', error);
          reject(error);
        },
      );
    });
  });
};

export const deleteProduct = async (db, productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `DELETE FROM products WHERE id = ?`,
          [productId],
          (_, result) => {
            if (result.rowsAffected > 0) {
              console.log('✅ Product deleted from table products');
            } else {
              console.log(
                '⚠️ No product found with ID in table products:',
                productId,
              );
            }
            resolve(result);
          },
          (txObj, error) => {
            console.log(
              '❌ Error deleting the product from table products: ',
              error,
            );
            reject(error);
            return true;
          },
        );
        tx.executeSql(
          `DELETE FROM stocks WHERE product_id = ?`,
          [productId],
          (_, result) => {
            if (result.rowsAffected > 0) {
              console.log('✅ Product deleted from table stocks');
            } else {
              console.log(
                '⚠️ No product found with ID in table stocks:',
                productId,
              );
            }
            resolve(result);
          },
          (txObj, error) => {
            console.log(
              '❌ Error deleting the product from table stocks: ',
              error,
            );
            reject(error);
            return true;
          },
        );
      },
      error => {
        console.log('❌ Transaction error:', error);
        reject(error);
      },
    );
  });
};

export const getImageFromCacheAndSave = async imageUri => {
  try {
    if (!imageUri || typeof imageUri !== 'string') {
      console.warn('❗ imageUri is invalid:', imageUri);
      return null;
    }

    const fileName = `image_${Date.now()}.jpg`;
    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    if (imageUri.startsWith('file://')) {
      const exists = await RNFS.exists(imageUri);

      if (exists) {
        await RNFS.copyFile(imageUri, destPath);
        console.log('Image saved to document folder:', destPath);
      } else {
        console.warn('❗ Source image does not exist:', imageUri);
      }
    }

    return `file://${destPath}`;
  } catch (error) {
    console.error('Error saving image from cache:', error);
    throw error;
  }
};

export const saveProductOffline = async (db, product, branchId) => {
  const now = dayjs().format('YYYY-MM-DDTHH:mm:ss');

  return new Promise(async (resolve, reject) => {
    const currentProductId = product.product_id ?? product.id;
    const isEditing = typeof currentProductId === 'number';

    const verifyCode = await checkLocalCode(db, product.code);

    if (!isEditing) {
      if (verifyCode.rows.length > 0) {
        console.log('❌ Duplicate product code detected:', product.code);
        return reject(
          new Error(`Product code "${product.code}" already exists locally`),
        );
      }
    } else {
      const isDuplicate = Array.from({length: verifyCode.rows.length}).some(
        (_, i) => {
          const row = verifyCode.rows.item(i);
          const rowProductId = row.product_id ?? row.id;
          const currentProductId = product.product_id ?? product.id;
          const isSameCodeDifferentProduct = rowProductId !== currentProductId;

          return isSameCodeDifferentProduct;
        },
      );

      if (isDuplicate) {
        console.log(
          '❌ Duplicate code detected in another product:',
          product.code,
        );
        return reject(
          new Error(
            `Product code "${product.code}" already exists for another product`,
          ),
        );
      }
    }

    db.transaction(
      tx => {
        if (isEditing) {
          tx.executeSql(
            `
              UPDATE products 
              SET code = ?, name = ?, description = ?, updated_at = ?, price = ?, image = ? 
              WHERE id = ?`,
            [
              product.code,
              product.name,
              product.description,
              now,
              product.price,
              product.image,
              product.product_id,
            ],
            (_, updatedProduct) => {
              tx.executeSql(
                `
                  UPDATE stocks 
                  SET batch = ?, quantity = ?, updated_at = ? 
                  WHERE product_id = ? AND branch_id = ?`,
                [
                  product.batch,
                  product.quantity,
                  now,
                  product.product_id,
                  branchId,
                ],
                (_, result) => {
                  console.log(
                    'Product updated and saved locally',
                    product.product_id,
                  );
                  resolve(product.product_id);
                },
                (_, error) => {
                  console.log('❌ Error updating stock: ', error);
                  reject(error);
                },
              );
            },
            (_, error) => {
              console.log('❌ Error updating product: ', error);
              reject(error);
            },
          );
        } else {
          tx.executeSql(
            `
              INSERT INTO
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
              console.log('🟢 Produto criado com sucesso:', createdProduct);
              const productId = createdProduct.insertId;

              if (!productId) {
                console.log('❌ insertId retornou null!');
                return reject(
                  new Error('Produto não foi criado corretamente.'),
                );
              }

              console.log('📦 Inserindo no stocks com:', {
                productId,
                branchId,
                batch: product.batch,
                quantity: product.quantity,
              });

              tx.executeSql(
                `SELECT id FROM stocks WHERE product_id = ? AND branch_id = ? AND batch = ?`,
                [productId, branchId, product.batch],
                (_, res) => {
                  if (res.rows.length > 0) {
                    // Atualiza se já existe
                    const stockId = res.rows.item(0).id;
                    tx.executeSql(
                      `UPDATE stocks SET quantity = ?, updated_at = ?, synced = 0 WHERE id = ?`,
                      [product.quantity, now, stockId],
                      () => resolve(productId),
                      (_, error) => reject(error),
                    );
                  } else {
                    // Insere novo
                    tx.executeSql(
                      `INSERT INTO stocks (product_id, branch_id, batch, quantity, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                      [
                        productId,
                        branchId,
                        product.batch,
                        product.quantity,
                        now,
                        now,
                        0,
                      ],
                      () => resolve(productId),
                      (_, error) => reject(error),
                    );
                  }
                },
                (_, error) => reject(error),
              );
            },
            (_, error) => {
              console.log('❌ Error saving product: ', error);
              reject(error);
            },
          );
        }
      },
      error => {
        console.log('Transaction error: ', error);
        reject(error);
      },
    );
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
        tx.executeSql(
          `
          DELETE FROM stocks;
          `,
          [],
          (_, results) => {
            if (results.rowsAffected != 0) {
              console.log('✅ Stock deleted ');
            }
            resolve(results);
          },
          (_, error) => {
            console.log('❌ Error deleting stock ');
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('❌ Error deleting the product:', error.response);
    }
  });
};

export const getStockProduct = async (db, productId) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `
            SELECT * FROM products WHERE id = ?
          `,
          [productId],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            console.log(' ❌ Error getting the product');
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('❌ Error getting the product', error.response);
    }
  });
};

export const adjustStockQuantity = async (
  db,
  productId,
  newQuantity,
  branchId,
) => {
  const userId = await AsyncStorage.getItem('userId');

  const stockQuantity = await new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
          SELECT quantity FROM stocks WHERE product_id = ? AND branch_id = ?
        `,
        [productId, branchId],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0).quantity);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.log('❌ Error fetching stock quantity:', error);
          reject(error);
        },
      );
    });
  });

  const quantityChange = newQuantity - stockQuantity;

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `
          UPDATE stocks SET quantity = ? WHERE product_id = ? AND branch_id = ?
        `,
          [newQuantity, productId, branchId],
          (_, result) => {
            console.log('✅ Stock quantity updated successfully');
            resolve(result);
          },
          (_, error) => {
            console.log('❌ Error updating stock quantity:', error);
            reject(error);
          },
        );

        tx.executeSql(
          `
          INSERT INTO stock_logs (user_id, branch_id, product_id, old_quantity, new_quantity, quantity_change, action, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            userId,
            branchId,
            productId,
            stockQuantity,
            newQuantity,
            quantityChange,
            'manual_adjustment',
            Date.now(),
            Date.now(),
          ],
          (_, result) => {
            console.log('✅ Stock log entry created successfully');
          },
          (_, error) => {
            console.log('❌ Error creating stock log entry:', error);
            reject(error); // Ensure the promise rejects on error
          },
        );
      },
      error => {
        console.log(
          '❌ Transaction error while creating stock log entry:',
          error,
        );
        reject(error); // Handle transaction-level errors
      },
      () => {
        resolve('Stock log entry created successfully'); // Resolve the promise on success
      },
    );
  });
};

export const showBranchStockData = db => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
          SELECT
            p.id,
            p.code,
            p.name,
            p.description,
            p.price,
            p.image,
            p.sync_error,
            p.synced as product_synced,
            p.created_at as product_created_at,
            p.updated_at as product_updated_at,

            s.id as stock_id,
            s.product_id as stock_product_id,
            s.branch_id,
            s.batch,
            s.quantity,
            s.synced as stock_synced,
            s.created_at as stock_created_at,
            s.updated_at as stock_updated_at
          FROM products p
          LEFT JOIN stocks s ON p.id = s.product_id;
        `,
        [],
        (_, results) => {
          resolve(results.rows.raw());
        },
        (_, error) => {
          console.log('❌ SQL error:', error);
          reject(error);
        },
      );
    });
  });
};

export const getUnsyncedStockCount = db => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
        SELECT COUNT(*) as unsyncedCount FROM products WHERE synced = 0
        `,
        [],
        (_, results) => {
          resolve(results.rows.item(0).unsyncedCount);
        },
        (_, error) => {
          console.log('❌ Error fetching unsynced stock count:', error);
          reject(error);
        },
      );
    });
  });
};

export const fullSync = async db => {
  if (!(await isOnline())) return;

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
          INNER JOIN stocks s ON p.id = s.product_id
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

          const errors = [];

          const syncProduct = async product => {
            const codeAvailability = await checkCodeAvailable(db, product.code);

            if (
              codeAvailability.exists ||
              codeAvailability.source === 'server'
            ) {
              // Marca o erro localmente
              db.transaction(tx => {
                tx.executeSql(
                  `UPDATE products SET sync_error = 'duplicate_code' WHERE id = ?`,
                  [product.id],
                );
              });

              // Armazena o erro para retornar depois
              errors.push({
                id: product.id,
                code: product.code,
                name: product.name,
                error_message: `Duplicated code: ${product.code}`,
              });
              return;
            }

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
                          rejectTx(error);
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
                '❌ Error syncing the product:',
                err.response || err.message,
              );

              errors.push({
                id: product.id,
                code: product.code,
                name: product.name,
                error_message: `Sync error for ${product.name}`,
              });
            }
          };

          (async () => {
            try {
              for (const product of unsynced) {
                await syncProduct(product);
              }

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

                        if (errors.length > 0) {
                          resolve(errors); // retorna lista de erros
                        } else {
                          resolve('synced'); // sucesso sem erros
                        }
                      },
                      (_, error) => {
                        console.log('❌ Error deleting products:', error);
                        reject(error);
                      },
                    );
                  },
                  (_, error) => {
                    console.log('❌ Error deleting stocks:', error);
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
        (_, error) => {
          console.log('❌ SQL select error:', error);
          reject(error);
        },
      );
    });
  });
};
