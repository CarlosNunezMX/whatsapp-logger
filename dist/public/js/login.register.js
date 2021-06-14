const hasSession = localStorage.getItem("token");
if(hasSession){
    window.location = "/app"
}

const login = document.getElementById("login");
const loader = document.getElementById("b")
loader.classList.remove("section")
/**
 * 
 * @param {Event} e 
 */
 const loginSubmit = (e) => {
    const error = document.getElementById("error")
    const loginBtn = document.getElementById("loginBtn")

    error.innerHTML = "";
    error.classList.remove("error")
    loginBtn.classList.remove("error")
    
    
    e.preventDefault();
    const name = document.getElementById("name").value;
    const pwd = document.getElementById("password").value;
    if(name === "" || pwd === ""){
        return
    }

    const body = {
        name,
        password: pwd
    }
    fetch("/api/login", {
        method: "POST",
        body : JSON.stringify(body),
        headers:{
            "Content-Type": "application/json"
        }
    }).then(e=>e.json()).then(e=>{
        if(e.message){
            loginBtn.classList.add("error")
            error.innerText = e.message;
            error.classList.add("error")
            return;
        }
        loader.classList.add("section")
        loader.classList.remove("hidden")
        const o = document.getElementById("a")
        o.classList.add("hidden")

        localStorage.setItem("token",e.token.token)
        setTimeout(()=>{
            window.location = "/app"
        },3000)
    })
}

login.addEventListener("submit",loginSubmit)

