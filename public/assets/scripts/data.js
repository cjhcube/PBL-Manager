/* 
PBL Manager
An online tool to store and train Square-1 PBL algs.
v2.0.1

Original author: Charlie Harrison.

Released under the MIT License.
*/

function loadPbls(callback) {
    if (localStorage.getItem("pbls") === null) {
        $.getJSON("assets/data/init.json", pbls => {
            callback(pbls);
            localStorage.setItem("pbls", JSON.stringify(pbls));
        });
        return;
    } else {
        let pbls = JSON.parse(localStorage.getItem("pbls"));
        callback(pbls);
        return;
    }
}

function updatePbls(pbls) {
    localStorage.setItem("pbls", JSON.stringify(pbls));
}
