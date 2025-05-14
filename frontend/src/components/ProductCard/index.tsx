import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import SlideInView from '../SlideView';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {Product} from '../../screens/Branches/Stock';

type ProductCard = {
  onPressCard: () => void;
  editable: boolean;
  item: Product;
  wasChanged: boolean;
  newQuantity: string;
  getImageByProductId: () => number;
  onPressAdjustQuantityIncrement: () => void;
  onPressAdjustQuantityDecrement: () => void;
};

const ProductCard = ({
  onPressCard,
  editable,
  item,
  wasChanged,
  newQuantity,
  getImageByProductId,
  onPressAdjustQuantityIncrement,
  onPressAdjustQuantityDecrement,
}) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetailWrapper}>
        <TouchableOpacity onPress={onPressCard}>
          <View
            style={[
              styles.nameContainer,
              {borderTopRightRadius: !editable ? 10 : 0},
            ]}>
            <Text
              style={styles.itemName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.name}
            </Text>
            {item.product_synced === 0 && (
              <View style={styles.unsyncedContainer}>
                <Text
                  style={styles.unsyncedText}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Unsynced
                </Text>
              </View>
            )}
            <Text style={styles.itemCode}># {item.code}</Text>
          </View>

          <View style={styles.itemDetailContainer}>
            <View style={styles.infoWrapper}>
              <View style={[styles.infoContainer]}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={styles.itemBatch}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    Batch {item.batch}
                  </Text>
                </View>
                <Text
                  style={styles.itemDetails}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Quantity:
                </Text>
                <View style={styles.quantityValueContainer}>
                  {wasChanged ? (
                    <SlideInView direction="right" distance={30} style={{}}>
                      <Text
                        style={[
                          styles.detailsHighlighted,
                          wasChanged && styles.oldNumber,
                        ]}>
                        {item.quantity}
                      </Text>
                    </SlideInView>
                  ) : (
                    <Text
                      style={[
                        styles.detailsHighlighted,
                        wasChanged && styles.oldNumber,
                      ]}>
                      {item.quantity}
                    </Text>
                  )}

                  {wasChanged && (
                    <>
                      <SlideInView direction="left" distance={10} style={{}}>
                        <IconFontAwesome
                          name="arrow-right"
                          size={20}
                          style={{marginBottom: 5}}
                        />
                      </SlideInView>
                      <SlideInView direction="left" distance={10} style={{}}>
                        <Text
                          style={[
                            styles.detailsHighlighted,
                            styles.newQuantityValue,
                          ]}>
                          {newQuantity}
                        </Text>
                      </SlideInView>
                    </>
                  )}
                </View>
              </View>
              {item.image && (
                <SlideInView direction="left" distance={10} style={{}}>
                  <View
                    style={[
                      styles.imageContainer,
                      {alignItems: editable ? 'center' : 'flex-end'},
                    ]}>
                    {!editable && (
                      <Image
                        source={{uri: getImageByProductId}}
                        style={styles.imageStyle}
                      />
                    )}
                  </View>
                </SlideInView>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {editable && (
        <View style={{...(editable && {flex: 1})}}>
          <>
            <TouchableOpacity
              onPress={onPressAdjustQuantityIncrement}
              style={[
                editable && styles.buttonAdjust,
                {borderTopRightRadius: 10},
                {borderBottomWidth: 1},
              ]}>
              <IconFontAwesome name="plus" size={25} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPressAdjustQuantityDecrement}
              style={[
                editable && styles.buttonAdjust,
                {borderBottomRightRadius: 10},
              ]}>
              <IconFontAwesome name="minus" size={25} />
            </TouchableOpacity>
          </>
        </View>
      )}
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
  },
  infoWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemDetailWrapper: {
    flex: 3,
  },
  itemDetailContainer: {
    padding: 10,
  },
  itemDetails: {
    marginTop: 10,
    fontSize: 18,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  itemCode: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#0f2416',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    backgroundColor: '#297c2f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  itemBatch: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  unsyncedText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffe260',
    fontSize: 20,
    borderRadius: 10,
    fontFamily: 'Poppins-Bold',
    color: '#ac5e00',
  },
  unsyncedContainer: {
    justifyContent: 'flex-end',
  },
  quantityValueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  detailsHighlighted: {
    color: '#579b6a',
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
  },
  oldNumber: {
    color: 'black',
    fontSize: 22,
    textDecorationLine: 'line-through',
  },
  newQuantityValue: {
    fontSize: 32,
  },
  imageStyle: {
    height: 120,
    width: 160,
    borderRadius: 10,
  },
  buttonAdjust: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#d8d8d8',
  },
});
