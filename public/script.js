let user=localStorage.getItem("user");

async function login(){
const u=document.getElementById("user").value;
const p=document.getElementById("pass").value;
const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})});
const j=await r.json();
if(!j.status)return alert("Login gagal");
localStorage.setItem("user",u);
location.href="dashboard.html";
}

async function loadUser(){
if(!user)return;
const r=await fetch("/api/user/"+user);
const j=await r.json();
document.getElementById("saldo").innerText="Saldo: Rp "+(j.saldo||0).toLocaleString();
}

async function deposit(){
const nominal=document.getElementById("nominal").value;
const r=await fetch("/api/deposit/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user,nominal})});
const j=await r.json();
document.getElementById("qris").innerHTML=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${j.data.qr_string}">`;
poll(j.data.id,nominal);
}

function poll(id,nominal){
const i=setInterval(async()=>{
const r=await fetch("/api/deposit/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,username:user,nominal})});
const j=await r.json();
if(j.data?.status==="success"){
clearInterval(i);
document.getElementById("status").innerText="Deposit Berhasil";
loadUser();
}},5000);
}

if(location.pathname.includes("dashboard"))loadUser();
