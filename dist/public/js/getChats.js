const x = document.getElementById("msgContainer");
const Chats = fetch("/api/chats/getAll", {
    headers: {
        "login": GetSession()
    }
}).then(e => e.json()).then(e => {
    console.log(e);
    if (e.message) {
        return ErrHandler(e.message, "error")
    }
    e.users.map((e, i) => {
        Handler(e, i)
    })
    return e
})
const Handler = (obj, i) => {
    const pre = `
    <div class="chatCard">
        <p class="number">${obj.authorNumber}</p>
        <p class="lastMessage">${obj.messages.pop().message}</p>
    </div>
    `
    x.innerHTML += pre

}
const ErrHandler = (e, Element) => {
    let errContainer = document.getElementById("Element")
    errContainer.classList.add("error")
    errContainer.innerText = e
}