import UserService from  "../services/UserService";
const userService = new UserService();

class UserController {

  constructor() {
    this.service = userService;
    this.getAll = this.getAll.bind(this);
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getByAuthor = this.getByAuthor.bind(this);
  }

  async getAll(req, res) {
    return res.status(200).send(await this.service.getAll(req.query));
  }

  async getByAuthor(req, res){
    const { id } = req.params;
    let response = await this.service.getByAuthor(req.query,id)
    return res.status(response.statusCode).send(response);  }

  async get(req, res) {
    let response = await this.service.get(req.params)
    return res.status(response.statusCode).send(response);
  }

  async insert(req, res) {
    let response = await this.service.insert(req.body);
    return{
    response : error ? res.status(response.statusCode).send(response) : res.status(201).send(response)
    }
  }



  async signIn(req, res) {
    let response = await this.service.signIn(req.body);
    return {
      status: res.status(response.statusCode).send(response),
  }  }



  async update(req, res) {
    const { id } = req.params;

    let response = await this.service.update(id, req.body);

    return res.status(response.statusCode).send(response);
  }

  async delete(req, res) {
    const { id } = req.params;

    let response = await this.service.delete(id);

    return res.status(response.statusCode).send(response);
  }

}

export default new UserController();
