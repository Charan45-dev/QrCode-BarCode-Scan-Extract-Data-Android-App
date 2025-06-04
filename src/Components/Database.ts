import Realm from 'realm';

export class User extends Realm.Object<User> {
  _id!: Realm.BSON.ObjectId;
  username!: string;
  email!: string;
  phone!: string;
  password!: string;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      username: 'string',
      email: 'string',
      phone: 'string',
      password: 'string',
      createdAt: 'date',
    },
  };
}

export class ScannedData extends Realm.Object<ScannedData> {
  _id!: Realm.BSON.ObjectId;
  type!: string;
  data!: string;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'ScannedData',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      type: 'string',
      data: 'string',
      createdAt: 'date',
    },
  };
}

export const getRealm = async () => {
  return await Realm.open({
    path: 'myapp.realm', // Explicit path for easier debugging
    schema: [User, ScannedData],
    schemaVersion: 3,
  });
};