//jshint esversion:6
var _ = require('lodash');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const url = "mongodb+srv://admin-ashish:123_Test@cluster0.nyms3nr.mongodb.net/todolistDb";
const port = 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
main().catch(err => console.log(err));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
async function main() {
  await mongoose.connect(url);

 
  const itemSchema = new mongoose.Schema({
    name: String
  });


  const Item = new mongoose.model("Item", itemSchema);

  const item1 = new Item({
    name: "Welcome to your to do list"
  });
  const item2 = new Item({
    name: "Hit the + button to add new item"
  });
  const item3 = new Item({
    name: "<-- Hit this delete an item"
  });

  // await Item.insertMany([item1,item2,item3]);
  const newSchema = new mongoose.Schema({
    name: String,
    lists: [itemSchema]
  });
  const List = new mongoose.model("List", newSchema);
  
  //
  app.get('/favicon.ico', (req, res) => {
    // Do nothing or send an empty response (status 204)
    res.status(204).end();
  });
  

  app.get("/", async function (req, res) {

    //const day = date.getDate();
    const items = await Item.find({}).exec();
    if (items.length === 0) {
      await Item.insertMany([item1, item2, item3]);
    }
    //console.log(items);
    res.render("list", { listTitle: "Today", newListItems: items });

  });

  app.post("/", async function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name: itemName
    });
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      const searchList = await List.findOne({ name: listName });
      searchList.lists.push(item);
      searchList.save();
      res.redirect("/" + listName);
    }

  });
  app.post("/delete", async (req, res) => {
    const id = req.body.deleteItem;
    const listName = req.body.delete;
    //console.log(id);
    //console.log(listName.length);
    if (listName === "Today") {
      setTimeout(() => {
        res.redirect("/");
      }, 100);
      
      await Item.deleteOne({ _id: id });
      
    } else {
     await List.findOneAndUpdate({ name: listName }, { $pull: { lists: { _id: id } } });
     res.redirect("/"+listName);
     console.log("under else");
    }

  });


  app.get("/:CustomeListName", async (req, res) => {
    const CustomeListName = _.upperFirst(req.params.CustomeListName) ;
    //console.log(CustomeListName);
    const store = await List.findOne({ name: CustomeListName });
    if (!store) {
      //console.log("not exists");
      const list = new List({
        name: CustomeListName,
        lists: [item1, item2, item3]
      });
      list.save();
      res.redirect("/" + CustomeListName);
    } else {
      //console.log("exists")
      if(store.lists.length===0){
        await List.updateOne({name:CustomeListName},{lists:[item1, item2, item3]});
      }
      res.render("list", { listTitle: store.name, newListItems: store.lists })
    }

  })

  app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
  });

  app.get("/about", function (req, res) {
    res.render("about");
  });
  
  app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
    console.log('Server started on port '+app.get('port'));
});
}
