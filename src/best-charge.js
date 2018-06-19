"use strict";
const loadAllItems = require("./items");
const loadPromotions = require("./promotions");

function bestCharge(selectedItems) {
  let temp = [];
  let result = "============= 订餐明细 =============\n";
  let cu = complete_userinput(format_userInput(selectedItems));
  cu.forEach(item =>{
    result += item.name + " x " + item.count + " = " + item.smallsum + "元\n";
    if(item.isHalfProduce == 1){
      temp.push(item.name);
    }
  });
  let aps = addPromotionSave(cu);
  if(aps.promotionsType != "无"){
    result += "-----------------------------------\n";
    result += "使用优惠:\n";
  }
  if(aps.promotionsType == "满30减6元"){
    result += aps.promotionsType +  "，" + "省" + aps.FullCutSaved + "元\n";
  }else if(aps.promotionsType == "指定菜品半价"){
    result += aps.promotionsType + "(";
    for(var i =0;i<temp.length-1;i++){
      result += temp[i] + "，";
    }
    result += temp[temp.length-1] + ")" + "，" + "省" + aps.HalfCutSaved + "元\n";
  }
  result += "-----------------------------------\n";
  let sumPrice = addSumPrice(aps);
  result += "总计：" + sumPrice + "元\n";
  result += "===================================\n";
  return result;
}

/*格式化用户输入*/
function format_userInput(userInputs){
  let formated_userinput = [];
  userInputs.forEach(item =>{
    let id = item.split("x")[0];
    let count = parseInt(item.split("x")[1]);
    formated_userinput.push({id:id,count:count});
  });
  return formated_userinput;
}

//完成用户输入
function complete_userinput(formated_userinput){
  let completed_userinput = formated_userinput;
  let allItems = loadAllItems();
  let promo = loadPromotions()[1].items;
  //加入单价信息
  completed_userinput.forEach(item_user=>{
    allItems.forEach(item_all =>{
      if(item_user.id.trim() === item_all.id.trim()){
        item_user.name = item_all.name;
        item_user.price = item_all.price;
        item_user.smallsum = parseInt(item_user.price * item_user.count);   // 总价
      }

    });
  });
  completed_userinput.forEach(item =>{
    item.isHalfProduce = 0;
  })
  //加入优惠信息
  completed_userinput.forEach(function(value_user,index_user){
    promo.forEach(function(value_pro,index_pro){
      if(value_user.id.trim() == value_pro.trim()){
        value_user.isHalfProduce = 1;  //该菜品为半价菜品
      }
    });
  });
  return completed_userinput;
}

//添加节省金额
function addPromotionSave(completed_userinput){
  let originSum = 0;
  let FullCutSaved = 0;
  let HalfCutSaved = 0;
  let addedPromotionSave = {};

  //求总和
  completed_userinput.forEach(item =>{
    originSum += item.smallsum;
  });
  completed_userinput.forEach(item =>{
    if(item.isHalfProduce === 1)
      HalfCutSaved += item.price / 2;
  });
  originSum >= 30 ? FullCutSaved= 6 : 0;

  if (FullCutSaved > HalfCutSaved){
    addedPromotionSave.promotionsType = "满30减6元";
  }else if(FullCutSaved <= HalfCutSaved && HalfCutSaved !== 0){
    addedPromotionSave.promotionsType = "指定菜品半价";
  }else if(HalfCutSaved === 0 && FullCutSaved === 0){
    addedPromotionSave.promotionsType = "无";
  }

  addedPromotionSave.receipt = completed_userinput;
  addedPromotionSave.FullCutSaved = FullCutSaved;
  addedPromotionSave.HalfCutSaved = HalfCutSaved;
  return addedPromotionSave;
}

//计算总价
function addSumPrice(addedPromotionSave){
  let sumPrice = 0;
  let sum = 0;
  let addedPromotionSum = addedPromotionSave;
  addedPromotionSum.receipt.forEach(item =>{
    sum += item.smallsum;
  })
  if(addedPromotionSum.promotionsType == "指定菜品半价"){
    sumPrice = sum - addedPromotionSum.HalfCutSaved;
  }else if(addedPromotionSum.promotionsType == "满30减6元"){
    sumPrice = sum - addedPromotionSum.FullCutSaved;
  }else{
    sumPrice = sum;
  }
  return sumPrice;
}
module.exports=bestCharge;
