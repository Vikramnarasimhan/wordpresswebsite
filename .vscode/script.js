
class Editor {
  constructor(root) { this.root = root; }
  cmd(command, value = null) {
    document.execCommand(command, false, value);
    this.root.focus();
  }
  insertLink(url) {
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    this.cmd("createLink", url);
  }
  insertImage(url) {
  const wrapperHTML = `
    <div contenteditable="false" class="img-wrapper" draggable="true">
      <img src="${url}" />
    </div>
  `;
  this.cmd("insertHTML", wrapperHTML);
}

  insertTable(rows = 2, cols = 2) {
    let html = ` <table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;">`;
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) html += `<td style="border: 1px solid #ccc; padding: 12px; min-width: 100px;">&nbsp;</td>`;
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


const editor = new Editor(document.getElementById("editor"));
const modal = new Modal(document.getElementById("modalBackdrop"), document.getElementById("previewArea"));
const exporter = new Exporter(editor);


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
document.getElementById("undoing").onclick = () => 
  editor.cmd("undo");
const editorRoot = document.getElementById("editor");

let draggedElement = null;

editorRoot.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("img-wrapper")) {
    draggedElement = e.target; 
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.dataTransfer.effectAllowed = "move";
  }
});

editorRoot.addEventListener("dragover", (e) => {
  e.preventDefault(); 
});

editorRoot.addEventListener("drop", (e) => {
  e.preventDefault();
  const html = e.dataTransfer.getData("text/html");

  const range = document.caretPositionFromPoint
    ? (() => {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        const range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
        return range;
      })()
    : document.caretRangeFromPoint(e.clientX, e.clientY);

  if (range) {
    range.deleteContents();
    const temp = document.createElement("div");
    temp.innerHTML = html;
    range.insertNode(temp.firstChild);

    if (draggedElement) {
      draggedElement.remove();
      draggedElement = null;
    }
  }
});
