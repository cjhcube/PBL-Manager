/* 
PBL Manager
An online tool to store and train Square-1 PBL algs.
v2.0.1

Original author: Charlie Harrison.

Released under the MIT License.
*/

loadPbls(pbls => {
    let params = new URLSearchParams(window.location.search);
    let currentSet = params.get("set");
    let tops = pbls.map(pbl => pbl.top);
    let topsUnique = tops.filter((v, i, a) => { return a.indexOf(v) == i; });
    
    // Load side nav
    function loadSideNav() {
        let sideNav = $("#setNav");
        sideNav.empty();
        topsUnique.forEach(v => {
            sideNav.append(`<li class="nav-item">
                <a class="nav-link pl-3${currentSet == v ? " active" : ""}" href="?set=${v}">
                    ${v} (${pbls.filter(pbl => (pbl.top == v) && (pbl.algs.length > 0)).length})
                </a>
            </li>
            `);
        });
    }
    
    // Load alg list
    function loadAlgList() {
        let algList = $("#algList");
        algList.empty();
        if (currentSet === null) {
            algList.append("<p>Select a set to get started.</p>");
        } else {
            let filteredAlgList = pbls.filter(v => (v.top == currentSet) && (v.algs.length > 0));
            if (filteredAlgList.length === 0) {
                algList.append("<p>This set is empty, add some algs to see them here!</p>");
            } else {
                 filteredAlgList.forEach(v => {
                    let algs = "";
                    v.algs.forEach((a, ai, aa) => {
                        algs += `${a.alg}&nbsp;&nbsp;<span class="text-muted">${a.angle}</span>&nbsp;&nbsp;
                        <i class="fa fa-trash text-muted deleteAlg" data-index="${ai}"></i><br>`
                    });
                    algList.append(`<div class="card my-3">
                        <div class="card-body">
                            <h5 class="card-title">${v.top}/${v.bottom}</h5>
                            <div class="row">
                                <div class="col-auto my-auto">
                                    <img width="200" src="http://cubiclealgdbimagegen.azurewebsites.net/generator?puzzle=sq1&alg=${encodeURIComponent(v.setup)}">
                                </div>
                                <div class="col-auto">
                                    <div class="card-text" data-top="${v.top}" data-bottom="${v.bottom}">${algs}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `)
                });
                $(".deleteAlg").click(function() {
                    let topToDelete = $(this).parent()[0].dataset.top;
                    let bottomToDelete = $(this).parent()[0].dataset.bottom;
                    let pblToDelete = pbls.find(pbl => (pbl.top == topToDelete) && (pbl.bottom == bottomToDelete));
                    pblToDelete.algs.splice(parseInt($(this)[0].dataset.index), 1);
                    updatePbls(pbls);
                    loadSideNav();
                    loadAlgList();
                });
            }
        }
    }
    
    loadSideNav();
    loadAlgList();
    
    // Load add modal
    let addModal = `<div class="modal fade" id="addModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">New Alg</h5>
                </div>
                <div class="modal-body">
                    <div id="addModalAlerts"></div>
                    <div class="form-group">
                        <label class="d-block">Case (non-parity only):</label>
                        <select id="addModalTop" class="form-control d-inline w-auto"></select>
                        /
                        <select id="addModalBottom" class="form-control d-inline w-auto"></select>
                    </div>
                    <div class="form-group">
                        <label for="addModalAlg">Alg (any notation):</label>
                        <input type="text" class="form-control" id="addModalAlg">
                    </div>
                    <div class="form-group">
                        <label for="addModalAngle">Angle (optional, any notation):</label>
                        <input type="text" class="form-control" id="addModalAngle">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button id="addModalAdd" class="btn btn-primary">Add</button>
                </div>
            </div>
        </div>
    </div>`;
    $("#add").click(function() {
        $("body").append(addModal);
        topsUnique.forEach(v => {
            let option = `<option name="${v}">${v}</option>
            `;
            $("#addModalTop").append(option);
            $("#addModalBottom").append(option);
        });
        $("#addModal").modal();
        $("#addModalAdd").click(function(e) {
            $("#addModalAlerts").empty();
            let top = $("#addModalTop").val();
            let bottom = $("#addModalBottom").val();
            let alg = $("#addModalAlg").val();
            let angle = $("#addModalAngle").val();
            let newCase = pbls.findIndex(pbl => (pbl.top == top) && (pbl.bottom == bottom));
            function addAlg() {
                pbls[newCase].algs.push({alg: alg, angle: angle});
                updatePbls(pbls);
                loadSideNav();
                loadAlgList();
                $("#addModal").modal("hide");
            }
            if (pbls[newCase] === undefined) {
                $("#addModalAlerts").append(`<div class="alert alert-danger">Please enter a valid case.</div>`);
            } else if (alg == "") {
                $("#addModalAlerts").append(`<div class="alert alert-danger">Please enter an alg.</div>`);
            } else {addAlg();}
        });
        $("#addModal").on("hidden.bs.modal", function() {
            $(this).remove();
        });
    });
    
    // Export JSON
    $("#export").click(function() {
        let pblString = JSON.stringify(pbls);
        let pblBlob = new Blob([pblString], {type: "application/json"});
        let pblUrl = URL.createObjectURL(pblBlob);
        window.open(pblUrl);
    });
    
    // Import JSON
    let importModal = `<div class="modal fade" id="importModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Import JSON</h5>
                </div>
                <div class="modal-body">
                    <p><strong>Make sure to back up your current algs first before importing, if you have any.</strong></p>
                    <div id="importModalAlerts"></div>
                    <div class="form-group">
                        <label for="importModalFile">Upload a JSON file:</label>
                        <input type="file" accept="application/json" class="form-control-file" id="importModalFile">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button id="importModalImport" class="btn btn-primary">Import</button>
                </div>
            </div>
        </div>
    </div>
    `;
    $("#import").click(function() {
        $("body").append(importModal);
        $("#importModalFile").change(function() {
            let importedFile = $(this).get(0).files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile, 'UTF-8');
            reader.onload = function(e) {
                pbls = JSON.parse(e.target.result);
                updatePbls(pbls);
                loadSideNav();
                loadAlgList();
                $("#importModal").modal("hide");
            }
        });
        $("#importModal").modal();
        $("#importModal").on("hidden.bs.modal", function() {
            $(this).remove();
        });
    });
});
