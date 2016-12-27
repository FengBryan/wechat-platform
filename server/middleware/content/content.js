module.exports = content={};
var loopback=require('loopback');
var util =require('../lib/util.js');
var dict =require('../lib/dict.js');
var app = require('../../server');
var fs = require('fs');
content.createNewType =function(req,res)
{
	if (!req.body)
	{
		console.log(util.makeRetMsg('fail','empty post'));
        res.send(util.makeRetMsg('fail','empty post'));
        return;
    }
    var custom = loopback.findModel('customModels');
    custom.find({where:{name:'customModels'}},function(err,obj)
    {
        var bodyObj = {};
        bodyObj = objErg(req.body);
     // console.log(bodyObj[2].name);
     // console.log(bodyObj);
     //    var db = app.dataSources['db'];
     //    var CreatedModel=loopback.createModel(bodyObj[2].name,bodyObj[0]);
     //    console.log(bodyObj);
     //    var op={};
	    // op.dataSource=db;
	    // loopback.configureModel(CreatedModel,op);
	    var insData = obj[0];
        var flag = insData.models.length;
        if (isExists(flag,insData.models,bodyObj[2].name)) 
        {
            res.send(util.makeRetMsg('fail','existing model name'));
            return;
        }       
        else if (!flag)
        {
            insData.models=[];
            insData.models[0]={};
            insData.models[0].name=bodyObj[2].name;
            insData.models[0].structure=bodyObj[0];
            insData.models[0].detail=bodyObj[1];
        }
        else
        {
            insData.models[flag]={};
            insData.models[flag].name = bodyObj[2].name;
            insData.models[flag].structure=bodyObj[0];
            insData.models[flag].detail=bodyObj[1];
        }
        custom.upsert(insData,function(uperr,upobj)
        {
            if(uperr)
            {
                console.log(uperr.message);
                return;
            }
            console.log(upobj);
        });
    });
}
content.getAllType = function(req,res)
{
    var custom = loopback.findModel('customModels');
    custom.find({where:{name:'customModels'}},function(err,obj)
    {
        var data={};
        var models=obj[0].models;
        for (var i in models)
        {
            data[models[i].name]=models[i].detail;
        }
        res.send(data);
    });
}
content.saveNewData = function (req,res)
{
    if (!req.body.name)
    {
        return;
    }
    
    var custom = loopback.findModel('customModels');
    custom.find({where:{name:'customModels'}},function(err,obj)
    {
        var van = obj[0].models;
        var back =searchModel(van,req.body.name);
        //console.log(CreatedModel);
        var databody=req.body;
        var existing =back[1].structure;
        var detail=back[1].detail;
        for (var i in existing)
        {
            if (i=='name' || i=='id' )
            {
                continue;
            }
            console.log(i);
            if (!databody[i] && !req.files[i])
            {
                console.log(util.makeRetMsg('fail','data error'));
                return;
            }
        }
        
        for (var j in detail)
        {
            if (detail[j].type=='pic')
            {
                console.log(req.files[j].path);
                var timestamp = Date.parse(new Date());
                var fileName = detail[j].title+timestamp+'.png';
                fs.rename(req.files[j].path,'/var/www/socialinzen/client/files/contentpic/'+fileName,function(a,b)
                {

                });
                databody[detail[j].title]='http://socialinzen.inzen.com.cn/files/contentpic/'+fileName;
                // console.log(databody[j]);
                //then change body data
            }
        }
        back[0].upsert(databody,function(uperr,obj)
        {   
            if (uperr)
            {
                console.log(uperr.message);
                return;
            }
            console.log(obj);
        });

    });
}
content.getAllData = function(req,res)
{
    var action = req.body.action;
    switch (action)
    {
        case 'gettypes':
        var custom = loopback.findModel('customModels');
        custom.find({where:{name:'customModels'}},function(err,obj)
        {
            var models = obj[0].models;
            var data={};
            for (var i in models)
            {
                if (models[i].name)
                {
                    data[i]=models[i].name;
                }
                
            }
            res.send(data);
        });
        break;
        case 'getcontents':
        var custom = loopback.findModel('customModels');
        custom.find({where:{name:'customModels'}},function(err,obj)
        {
            var contentName=req.body.name;
            var van =obj[0].models;
            var back = searchModel(van,contentName);
            back[0].find(function(ferr,fobj)
            {
                var data={};
                for (var i in fobj)
                {
                    data[i]=fobj[i].name;
                }
                res.send(data);
                return;
            });
        });
        break;
        case 'getcontentdetail':
        var custom = loopback.findModel('customModels');
        custom.find({where:{name:'customModels'}},function(err,obj)
        {
            var contentName=req.body.name;
            var contentTitle=req.body.title;   
            var van =obj[0].models;
            var back = searchModel(van,contentName);
            back[0].find(function(ferr,fobj)
            {
                var data={};
                for (var i in fobj)
                {
                    if(contentTitle==fobj[i].name)
                    {
                        data[i]=fobj[i];
                    }
                    if (!data)
                    {
                        res.send(util.makeRetMsg('fail','no such item'));
                        return;
                    }
                }
                res.send(data);
                return;
            });
        });
        break;
    }
}
var objErg = function(obj)
{   
	//console.log(obj);
	var retObj={};
	var detailObj={};
	var retArr =[];
	//console.log(i);
	for (var i in obj)
	{
		//console.log(i);
		if (i=='name')
		{
		   var data={};
		   data.name=obj[i];
		   retArr[2]=data;
		   continue;
		}
		var temp=dict.change(i);
		var data={};
		data.name=i;
		data.title=temp;
		data.type=obj[i];
		if(obj[i]=='pic')
		{
			retObj[temp]='string';
			detailObj[i]=data;
			continue;
		}
		retObj[temp]=obj[i];
		detailObj[i]=data;
	}
	retArr[0]=retObj;
    retArr[1]=detailObj;
	return retArr;
}
var isExists= function(length,obj,charger)
{
    for (var i=0;i<=length-1;i++)
    {
        if (obj[i].name==charger)
        {
            return true;
        }
    }
    return false;
}
var savePic = function()
{
    
}
var searchModel = function(van,name)
{
    for (var i in van)
    {
        if(van[i].name == name)
        {
            var structure = van[i];
            break;
        }
    }
    if (!structure)
    {
        console.log(util.makeRetMsg('fail','unkown content name'));
        return;
    }
    var loopback=require('loopback');
    var db = app.dataSources['db'];
    var CreatedModel=loopback.createModel(structure.name,structure.structure);
    //console.log(bodyObj);
    var op={};
    op.dataSource=db;
    loopback.configureModel(CreatedModel,op);
    var ret =[];
    ret[0]=CreatedModel;
    ret[1]=structure;
    return ret;
}

