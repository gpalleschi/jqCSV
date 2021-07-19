# jqCSV


----

## Description :

jqCSV is a html client utility to manage csv files, read, filter, modify rows, add new rows, delete rows, hide/show columns, export file csv in JSON, XML, CSV, TXT, SQL and MS-Excel. 

![jqCSV](./img/jqCSV.png)  

Tools presents a input field to insert commands to filter columns or summarize it.  
Each command is separated from each other by comma (,).  

Posible Syntaxs are :

Column Number  (ex. 1)  
Column Number from - Column Number to (ex 1-3 )  
Column Number : Regular Expression or 'C' for sum columns values>  (ex. 3:^ABC or 4:C )  

Column Number starts from 1.
Second parameter it's not necessary.  

For example expression : **1:^.*John.*$,2-3,4:C,5:C** in a csv with 5 Columns I want select only rows with :

<ul>
<li>First columns contains John</li>
<li>Show columns 2 and 3</li>
<li>Sum columns values of columns 4 and 5</li>
</ul>

![jqCSV](./img/jqCSV_2.png)  

Rows Selected :

![jqCSV](./img/jqCSV_3.png)    

----

## Installation :

Clone this repo  
Run **npm install**
Run **npm start**
Open site "http://(ip server):8080/jqCSV.html"  

----

## Built With :

Visual Code Editor  

----

## Authors

* **Giovanni Palleschi** - [gpalleschi](https://github.com/gpalleschi)  

----

## Prerequisites :

npm installed 

## License :

This project is licensed under the GNU GENERAL PUBLIC LICENSE 3.0 License - see the [LICENSE](LICENSE) file for details