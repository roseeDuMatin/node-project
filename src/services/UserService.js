import mongoose from "mongoose";
import User from "./../models/User";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const jwtExpirySeconds = 300;
const jwtKey="mySecretKey";

class UserWebService {
  constructor() {
    this.model = new User().getInstance();
    this.getAll = this.getAll.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }


  /**
   * GET All User
   */
  async getAll(query) {
    let { skip, limit } = query;

    skip = skip ? Number(skip) : 0;
    limit = limit ? Number(limit) : 10;

    delete query.skip;
    delete query.limit;

    if (query._id) {
      try {
        //Créer un ObjectID à partir de l'ID du Document récupèrer
        query._id = new mongoose.mongo.ObjectId(query._id);
      } catch (error) {
        console.log("not able to generate mongoose id with content", query._id);
      }
    }

    try {
      let items = await this.model
        .find(query)
        .skip(skip)
        .limit(limit);
      let total = await this.model.countDocuments();

      return {
        error: false,
        statusCode: 200,
        data: items,
        total
      };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors
      };
    }
  }



/**
 * INSERT Data in collection
 */
  async insert(data) {
    const hashedPassword = bcrypt.hashSync(data.password, 8);
    console.log("password:", data.password);
    console.log("hashedPassword:", hashedPassword);
    const username = data.username;
    data.password = hashedPassword;
    console.log("hashedPassword by data:", data.password);
    try {
      let item = await this.model.create(data);
      if (item)
      console.log("user created");
      const token = jwt.sign({ username }, jwtKey, {
        algorithm: 'HS256',
        expiresIn: jwtExpirySeconds
      });
      console.log('token:', token);
        return {
          error: null,
          token
        };
    } catch (error) {
      console.log("error", error);
      return {
        error: true,
        statusCode: 500,
        message: error.errmsg || "Not able to create item",
        errors: error.errors
      };
    }
  }



  async signIn(data){
    const username = data.username;
    console.log("username : ", data.username);
    console.log("password : ", data.password);
    const hashedPassword = bcrypt.hashSync(data.password, 8);
    console.log("hasched password : ", hashedPassword);
    let user = await this.model.findOne({ username: data.username });
    try{
      if(user){
        console.log("user :", user);
        const authenticate = bcrypt.compareSync(data.password ,user.password);
        console.log("authenticate = ", authenticate);
        if(authenticate){
          const token = jwt.sign({ username }, jwtKey, {
            algorithm: 'HS256',
            expiresIn: jwtExpirySeconds
          });
          console.log("token : ", token);
          return {
            error: null,
            token: token,
          }
        }else{
          console.log("wrong password");
          return {
            error: true
          }
        }
      }
    }catch (error) {
      console.log("error", error);
      return {
        error: true,
        statusCode: 500,
        message: error.errmsg || "Not able to create item",
        errors: error.errors
      };
    }


  }


/**
 * UPDATE Documents based on the ID
 */
  async update(id, data) {
    try {
      let item = await this.model.findByIdAndUpdate(id, data, { new: true });
      return {
        error: false,
        statusCode: 202,
        item
      };
    } catch (error) {
      return {
        error: true,
        statusCode: 500,
        error
      };
    }
  }
/**
 * DELETE the user by his username in parameter
 */
  async delete(username) {
    try {
      let item = await this.model.deleteOne({ username: username });
      if (!item)
        return {
          error: true,
          statusCode: 404,
          message: "item not found"
        };

      console.log("removed item", item);

      if (item.path) {
        console.log("unlink item", item.path);
        fs.unlink(item.path, function(err) {
          if (err) {
            console.log("error deleting file");
            throw err;
          }
          console.log("File deleted!");
        });
      }

      return {
        error: false,
        deleted: true,
        statusCode: 202,
        item
      };
    } catch (error) {
      return {
        error: true,
        statusCode: 500,
        error
      };
    }
  }
}
module.export = jwtKey;
export default UserWebService;
