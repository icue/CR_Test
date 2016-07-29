module.exports = { 
    user:{ 
        name:{type:String,required:true},
        status:{type:String,default: "offline"}
    },
    content:{ 
        name:{type:String,require:true},
        data:{type:String,require:true},
        time:{type:String,required:true}
    }
};