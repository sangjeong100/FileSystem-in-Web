const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const qs = require('querystring');

let file_name = "";
let file_content = "";
let MSG = "";
let cur_path = path.resolve('../fs');
let readcheck = "";

function hadError(err, res) {
    console.log(err);
    res.end("Server Error");
}

function index(res, tmpl) {
    fs.readdir(cur_path, function (err, data) {
        lsinfo = "";
        check = "file";
        let modifiedDate = "";
        let fileSize = "";
        let id=0;
        if (err) hadError(err, res);
        if(data != null)
        {
        data.forEach(function (element) {
            let stat = fs.statSync(`${cur_path}` + "/" + `${element}`);
            fileSize = stat["size"];
            modifiedDate = stat["mtime"].toISOString().split('T')[0];
            if (stat.isFile()) {
                lsinfo +=
                    "<tr class='file'>"
                    + `<td onclick='readfile(this);' id='data_${id}'> ${element} </td>`
                    + `<td><button type='button' onclick='rmFile(this);' id='deleteFileBtn_${id}' value='${element}' class='file' style='border:0;'>delete</button>`
                    + `<button type='button' onclick='rename(this);' id='renameFileBtn_${id}' value='${element}' class='file' style='border:0;'>rename</button></td>`
                    + `<td>${fileSize} B</td>`
                    + `<td>${modifiedDate}</td>`
                    + "</tr>";
                
            }
            else if (stat.isDirectory()) {
                lsinfo +=
                    "<tr class='dir'>"
                    + `<td onclick='cd(this);' id='data_${id}'>${element} </td>`
                    + `<td><button type='button' onclick='rmdir(this);' id='deleteDirBtn_${id}' value='${element}' class='dir' style='border:0;'>delete</button>`
                    + `<button type='button' onclick='rename(this)' id='renameDirBtn_${id}' value='${element}' class='dir' style='border:0;'>rename</button></td>`
                    + `<td>-</td>`
                    + `<td>${modifiedDate}</td>`
                    + "</tr>";
            }
            id+=1;
        });
        }
        let empty_modal = `<div id="editFileModal" class="modal" style="width:100%">`
        let empty_title = `<input name="title" type="text" placeholder="title" style="width:80%;margin-bottom:7px;" value="" id="edit_title"/>`
        let empty_content = `<textarea name="description" type="text" placeholder="description" style="width:80%;height:200px;" id="edit_textarea"></textarea>`

        let edit_modal = `<div id="editFileModal" class="modal" style="width:100%;display:block;">`
        let edit_title = `<input name="title" type="text" placeholder="title" style="width:80%;margin-bottom:7px;" value="${file_name}" id="edit_title"/>`
        let edit_content = `<textarea name="description" type="text" placeholder="description" style="width:80%;height:200px;" value="${file_content}" id="edit_textarea">${file_content}</textarea>`

        let html = tmpl.toString().replace('files', lsinfo);
        if(readcheck === "read")
        {
            //edit mdoal 설정
            html = html.replace(empty_modal, edit_modal);
            html = html.replace(empty_title, edit_title);
            html = html.replace(empty_content, edit_content);
            file_name = '';
            file_content = '';
            readcheck = "";
        }
        else {
            //edit modal 초기화
            html = html.replace(edit_modal, empty_modal); 
            html = html.replace(edit_title, empty_title);
            html = html.replace(edit_content, empty_content);
            html = html.replace('<h3 id="MSG"></h3>', `<h3 id="MSG">${MSG}</h3>`);
            MSG = "";
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
};

function readfile(req, res) {
    let body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        let post = qs.parse(body);
        file_name = post.file_name.trim();
        let file_path = path.join(cur_path, file_name);
        fs.readFile(file_path, 'utf8', function (err, data) {
            if(err){
                hadError(err,res);
            }
            file_content = data;
            readcheck = "read";
            res.writeHead(302, { Location: 'http://localhost:3000/' });
            res.end('success');
        });
    });
}

function editfile(req, res) {
    let body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        let post = qs.parse(body); //body 내용을
        let title = post.title;  //title
        let description = post.description; //description 으로 찢어줌
        let file_path = path.join(cur_path, title);
        //파일 편집 또는 생성
        fs.writeFile(file_path, description, function (err) {
            if(err) hadError(err,res);
            else{
                file_name = '';
                file_content = '';
                res.writeHead(302, { Location: 'http://localhost:3000/' });
                res.end('success');
            }
        });
    });
}

/* rmFile */
function rmFile(req, res) {
    let body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        let post = qs.parse(body);
        let file_name = post.file_name;
        let file_path = path.join(cur_path, file_name);
        fs.unlink(file_path, function (err) {
            if (err) {
                hadError(err, res);
            }
            else {
                file_name='';
                file_content='';
                res.writeHead(302, { Location: 'http://localhost:3000/' });
                res.end('success');
            }
        });

    });
}


/* rmdir */
function rmdir(req, res) {
    let body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        let post = qs.parse(body);
        let dir_name = post.dir_name;
        let dir_path = path.join(cur_path, dir_name);
        fs.rmdir(dir_path,{recursive: true}, function (err) { //폴더 삭제
            if (err) {
                hadError(err, res);
            }
            else {
                res.writeHead(302, { Location: 'http://localhost:3000/' });
                res.end('success');
            }
        });

    });
}


/* rename */
function rename(req,res){
    let body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        let post = qs.parse(body); //body 내용을
        let oldTitle = post.old_title;
        let newTitle = post.title;  //title
        let old_path = path.join(cur_path, oldTitle);
        let new_path = path.join(cur_path, newTitle);
        if (!fs.existsSync(new_path)) {
            fs.rename(old_path,new_path, function (err) {
                if(err){
                    hadError(err,res);
                }
                else{
                    res.writeHead(302, { Location: 'http://localhost:3000/' });
                    res.end('success');
                }
            });
        }
        else {
            MSG = '이미 존재하는 File 또는 Directory의 이름입니다.';
            res.writeHead(302, { Location: 'http://localhost:3000/' });
            res.end('fail');
        }
    });
}

function mkdir(req, res) {
    let body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        let post = qs.parse(body); //body 내용을
        let title = post.title;  //title
        let file_path = path.join(cur_path, title);
        if (!fs.existsSync(file_path)) {
            fs.mkdir(file_path, function (err) {
                if(err) hadError(err,res);
                res.writeHead(302, { Location: 'http://localhost:3000/' });
                res.end('success');
            });
        }
        else {
            MSG = '이미 존재하는 File 또는 Directory의 이름입니다.';
            res.writeHead(302, { Location: 'http://localhost:3000/' });
            res.end('fail');
        }
    });
}

function cd(req,res){
    file_name = '';
    file_content = '';
    let body = '';
    req.on('data', function(data){
        body = body + data;
    });
    req.on('end',function(){
        let post = qs.parse(body);
        cur_path = path.join(cur_path, post.file_name).trim();

        res.writeHead(302, { Location: 'http://localhost:3000/' });
        res.end('success');
    });
}



module.exports = {
	index,
	readfile,
	editfile,
	rmFile,
	rename,
    hadError,
    mkdir,
    cd,
    rmdir
}