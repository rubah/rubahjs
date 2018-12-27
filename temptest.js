const assert = require("assert");
const fs = require("fs");
const path = require("path");
const resolve = x=>path.resolve(process.cwd(),x);
const templ1 = (require(resolve("../react-boilerplate/template/container/")))('../react-boilerplate/template','../react-boilerplate/app');
const rubahjs = require("./index");

const rubah = Object.assign({},rubahjs);
rubah.register(templ1);
rubah.scan('../react-boilerplate/app',function(data){
    console.log(data);
})
