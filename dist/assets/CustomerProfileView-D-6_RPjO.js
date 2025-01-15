import{d as k,r as f,o as w,c as n,a as s,b as d,t as u,u as y,w as x,e as m,v as p,f as V,g as E,h as i,_ as D}from"./main-SXArKNhp.js";import{u as B}from"./customers-CLKtf8wD.js";const S={class:"customer-profile-container"},P={key:0,class:"loading-state"},U={key:1,class:"error-state"},M={key:2,class:"customer-profile"},N={class:"profile-header"},R={class:"contact-info"},_={class:"profile-details"},A={class:"form-group"},F={class:"form-group"},I={class:"form-group"},T={class:"form-group"},$={key:3,class:"not-found"},h=k({__name:"CustomerProfileView",setup(L){const g=V(),v=E(),b=B(),t=f(null),r=f(!0),a=f(null);async function c(){const l=g.params.id;if(!l){v.push("/dashboard/customers");return}r.value=!0,a.value=null;try{const e=await b.getCustomer(l);if(!e)throw new Error("Customer not found");t.value=e}catch(e){console.error("Error loading customer:",e),a.value=e instanceof Error?e.message:"Failed to load customer"}finally{r.value=!1}}async function C(){if(t.value)try{r.value=!0,await b.updateCustomer(t.value.id,t.value),alert("Customer details updated successfully")}catch(l){a.value=l instanceof Error?l.message:"Failed to update customer"}finally{r.value=!1}}return w(c),(l,e)=>(i(),n("div",S,[r.value?(i(),n("div",P,e[6]||(e[6]=[s("div",{class:"spinner"},null,-1),d(" Loading... ")]))):a.value?(i(),n("div",U,[s("p",null,u(a.value),1),s("button",{onClick:c,class:"btn btn-primary"},"Retry"),s("button",{onClick:e[0]||(e[0]=o=>y(v).push("/dashboard/customers")),class:"btn btn-secondary"},"Back to Customers")])):t.value?(i(),n("div",M,[s("div",N,[s("h1",null,u(t.value.name),1),s("div",R,[s("p",null,[e[7]||(e[7]=s("strong",null,"Phone:",-1)),d(" "+u(t.value.phone),1)]),s("p",null,[e[8]||(e[8]=s("strong",null,"Email:",-1)),d(" "+u(t.value.email),1)]),s("p",null,[e[9]||(e[9]=s("strong",null,"Address:",-1)),d(" "+u(t.value.address),1)])])]),s("div",_,[e[15]||(e[15]=s("h2",null,"Details",-1)),s("form",{onSubmit:x(C,["prevent"])},[s("div",A,[e[10]||(e[10]=s("label",{for:"name"},"Name",-1)),m(s("input",{"onUpdate:modelValue":e[1]||(e[1]=o=>t.value.name=o),id:"name",type:"text"},null,512),[[p,t.value.name]])]),s("div",F,[e[11]||(e[11]=s("label",{for:"phone"},"Phone",-1)),m(s("input",{"onUpdate:modelValue":e[2]||(e[2]=o=>t.value.phone=o),id:"phone",type:"text"},null,512),[[p,t.value.phone]])]),s("div",I,[e[12]||(e[12]=s("label",{for:"email"},"Email",-1)),m(s("input",{"onUpdate:modelValue":e[3]||(e[3]=o=>t.value.email=o),id:"email",type:"email"},null,512),[[p,t.value.email]])]),s("div",T,[e[13]||(e[13]=s("label",{for:"address"},"Address",-1)),m(s("textarea",{"onUpdate:modelValue":e[4]||(e[4]=o=>t.value.address=o),id:"address"},null,512),[[p,t.value.address]])]),e[14]||(e[14]=s("button",{type:"submit",class:"btn btn-success"},"Save",-1))],32)])])):(i(),n("div",$,[e[16]||(e[16]=s("p",null,"Customer not found",-1)),s("button",{onClick:e[5]||(e[5]=o=>y(v).push("/dashboard/customers")),class:"btn btn-primary"},"Back to Customers")]))]))}}),z=D(h,[["__scopeId","data-v-ed06f70b"]]);export{z as default};
