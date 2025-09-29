// Editor core
class Editor {
  constructor(root) { this.root = root; }
  cmd(command, value = null) {
    document.execCommand(command, false, value);
  }
  insertLink(url) {
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    this.cmd("createLink", url);
  }
  insertImage(url) {
    this.cmd("insertImage", url);
  }
  insertTable(rows = 2, cols = 2) {
    let html = "<table border='1'>";
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) html += "<td>&nbsp;</td>";
      html += "</tr>";
    }
    html += "</table>";
    this.cmd("insertHTML", html);
  }
  clear() {
    this.cmd("removeFormat");
    this.cmd("unlink");
  }
  reset() { this.root.innerHTML = ""; }
  get html() { return this.root.innerHTML; }
}

// Modal
class Modal {
  constructor(backdrop, content) {
    this.backdrop = backdrop;
    this.content = content;
    document.getElementById("closePreview").onclick = () => this.hide();
    backdrop.onclick = (e)=>{ if(e.target===backdrop) this.hide(); };
  }
  show(html) { this.content.innerHTML = html; this.backdrop.style.display="grid"; }
  hide() { this.backdrop.style.display="none"; }
}

// Exporter
class Exporter {
  constructor(editor) { this.editor = editor; }
  exportDoc(title, author) {
    let html = `<h1>${title}</h1><p><em>Author: ${author}</em></p><hr>${this.editor.html}`;
    let blob = new Blob([html], {type:"application/msword"});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (title||"document")+".doc";
    link.click();
  }
  exportPDF(title, author) {
    let container = document.createElement("div");
    container.innerHTML = `<h1>${title}</h1><p><em>Author: ${author}</em></p><hr>${this.editor.html}`;
    html2pdf().from(container).save((title||"document")+".pdf");
  }
}

// Init
const editor = new Editor(document.getElementById("editor"));
const modal = new Modal(document.getElementById("modalBackdrop"), document.getElementById("previewArea"));
const exporter = new Exporter(editor);

// Toolbar bindings
document.querySelectorAll("[data-cmd]").forEach(btn=>{
  btn.onclick = ()=>editor.cmd(btn.dataset.cmd);
});

document.getElementById("linkBtn").onclick = ()=>{
  let url = prompt("Enter URL:");
  if (url) editor.insertLink(url);
};

document.getElementById("imgUrlBtn").onclick = ()=>{
  let url = prompt("Image URL:");
  if (url) editor.insertImage(url);
};

document.getElementById("tableBtn").onclick = ()=>{
  let rows = parseInt(prompt("Rows?")||"2");
  let cols = parseInt(prompt("Cols?")||"2");
  editor.insertTable(rows, cols);
};

document.getElementById("clearFmt").onclick = ()=>editor.clear();
document.getElementById("resetDoc").onclick = ()=>editor.reset();

document.getElementById("previewBtn").onclick = ()=>{
  let title = document.getElementById("docTitle").value;
  let author = document.getElementById("docAuthor").value;
  modal.show(`<h1>${title}</h1><p><em>Author: ${author}</em></p><hr>${editor.html}`);
};

document.getElementById("exportDoc").onclick = ()=>{
  let title = document.getElementById("docTitle").value;
  let author = document.getElementById("docAuthor").value;
  exporter.exportDoc(title, author);
};
document.getElementById("exportPDF").onclick = ()=>{
  let title = document.getElementById("docTitle").value;
  let author = document.getElementById("docAuthor").value;
  exporter.exportPDF(title, author);
};