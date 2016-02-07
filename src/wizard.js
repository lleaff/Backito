var fs = require('fs-extra');
var readlineSync = require('readline-sync');
var jsonfile = require('jsonfile');
var cfgfile = require('./config.js').CFGFILE;

function menu()
{
    var destinations = [];
    console.log("1 : add a local directory");
    console.log("2 : add a git link");
    console.log("3 : add a svn link");
    console.log("4 : add an ftp adress");
    console.log("5 : add an ssh adress");
    var num = readlineSync.question('> ');
    if (isNaN(Number(num)) || (num < 1 || num > 5))
        return console.log('Please enter one of choices.');
    switch(Number(num)){
        case 1: 
            destinations.push(local());
            break;
        case 2: 
            destinations.push(serv());
            break;
        case 3: 
            destinations.push(serv());
            break;
        case 4:
            destinations.push(serv());
            break;
        case 5: 
            destinations.push(serv());
            break;
    }
    console.log(destinations)
}

function local()
{
   var obj = {};
   console.log("add your directory");
   var dir = readlineSync.question('> ');
   obj.dir = "local";
   obj.dir = dir;
   if (!fs.existsSync(dir))
   {
      console.log("this is not a directory.");
      local();
  }
  return (obj);
}

function serv()
{
   var obj = {};
   console.log("add your username");
   var user = readlineSync.question('> ');
   obj.user = user;
   console.log("Enter the ip adress"); 
   var link = readlineSync.question('> ');
   obj.dest = passwd;
   return (obj);
}

function writeConfig(destination) {
   var jsonString = destination;
   var json = JSON.stringify(JSON.parse(jsonString),null,2);
   jsonfile.writeFileSync(cfgfile, json);
}

module.exports = menu;