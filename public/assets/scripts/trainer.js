/* 
PBL Manager
An online tool to store and train Square-1 PBL algs.
v2.1.0

Original author: Charlie Harrison.

Released under the MIT License.
*/

loadPbls(pbls => {
    // Helper function to get a random item from an array
    function choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    function choicei(arr) {
        return Math.floor(Math.random() * arr.length);
    }

    // Display PBL cases in select menu
    pbls.forEach(pbl => {
        $("#caseSelect").append(`<option value="${pbl.top}/${pbl.bottom}">${pbl.top}/${pbl.bottom}</option>`);
    });
    
    // Get PBLs from a list of selected values, and vice versa
    function getPblsFromValues(values) {
        return pbls.filter(pbl => values.includes(pbl.top + "/" + pbl.bottom));
    }
    function getValuesFromPbls(pblCases) {
        return pblCases.map(pbl => pbl.top + "/" + pbl.bottom);
    }
    
    // Get and set selected PBLs
    function getSelectedCases() {
        return pbls.filter(pbl => pbl.train);
    }
    function setSelectedCases(values) {
        pbls.forEach(pbl => {
            if (values.includes(pbl.top + "/" + pbl.bottom)) {
                pbl.train = true;
            } else {
                pbl.train = false;
            }
        });
    }
    
    let eachOneOnce;
    
    function updateEOO() {
        eachOneOnce = $("#eachOneOnce").get(0).checked;
    }
    updateEOO();
    $("#eachOneOnce").click(updateEOO);
    
    // Update selected cases and random case on select change
    let selectedPbls = getSelectedCases();
    let availablePbls = getSelectedCases();
    let selectedValues = getValuesFromPbls(selectedPbls);
    selectedValues.forEach(value => {
        $("#caseSelect option[value=\"" + value + "\"]").attr("selected", "");
    });
    $("#caseSelect").selectpicker();
    $("#caseSelect").on("changed.bs.select", function(e, i, s, p) {
        selectedValues = $(this).val();
        selectedPbls = getPblsFromValues(selectedValues);
        setSelectedCases(selectedValues);
        availablePbls = getSelectedCases();
        updateEOO();
        updatePbls(pbls);
        randomCase();
    });
    
    // Random case/scramble
    let currentIndex, currentCase, currentScramble, lastCase, lastScramble;
    function randomCase() {
        if (selectedPbls.length > 0) {
            if (availablePbls.length > 0) {
                const flip = ["", "flip "];
                const auf = ["", "U ", "U' ", "U2 "];
                const adf = ["", "D ", "D' ", "D2 "];
                currentIndex = choicei(availablePbls);
                currentCase = availablePbls[currentIndex];
                currentScramble = choice(flip) + choice(auf) + choice(adf) + currentCase.setup + " " + choice(auf) + choice(adf);
                $("#scramble").html(currentScramble);
            } else {
                eachOneOnce = false;
                availablePbls = getSelectedCases();
            }
        } else {
            $("#scramble").html("Please select some cases first.");
        }
        console.log(eachOneOnce);
        console.log(currentCase);
        console.log(selectedValues);
        console.log(selectedPbls);
        console.log(availablePbls);
    }
    
    // Calculate mean
    function calculateMean(timeList) {
        let timeListValues = timeList.map(time => time.time);
        return (timeListValues.reduce((a, b) => {return a + b}, 0) / timeListValues.length).toFixed(3);
    }
    
    // Timer and time list
    let times = []; // [{time: Float, pbl: String}]
    let startTime;
    let stopTime;
    function stopTimer() {
        stopTime = Date.now();
        let finalTime = (stopTime - startTime) / 1000;
        $("#timer").html(finalTime.toFixed(3));
        times.push({
            time: finalTime,
            pbl: currentCase.top + "/" + currentCase.bottom
        });
        $("#caseSelect").removeAttr("disabled");
        
        lastCase = currentCase;
        lastScramble = currentScramble;
        printTimes();
        if (eachOneOnce) {
            availablePbls.splice(currentIndex, 1);
        }
        randomCase();
    }
    function startTimer() {
        startTime = Date.now();
        $("#timer").html("solve");
        $("#caseSelect").attr("disabled", "");
    }
    
    // Functions to handle key/touch input for starts and stops
    let timerStatus = "idle"; // "idle", "ready", "timing"
    function handleDown() {
        if (selectedPbls.length > 0) {
            switch (timerStatus) {
                case "idle":
                    timerStatus = "ready";
                    $("#timer").css("color", "#0a0");
                    break;
                case "timing":
                    stopTimer();
                    timerStatus = "idle";
            }
        }
    }
    function handleUp() {
        if (selectedPbls.length > 0) {
            if (timerStatus == "ready") {
                startTimer();
                timerStatus = "timing";
                $("#timer").css("color", "black");
            }
        }
    }
    $(window).keydown(handleDown);
    $(window).keyup(handleUp);
    $("#timerArea").on("touchstart", handleDown);
    $("#timerArea").on("touchend", handleUp);
    
    // Delete single time
    function deleteTime(elementId) {
        if (confirm("Are you sure you want to delete this time?")) {
            let index = parseInt(elementId.substr(1));
            times.splice(index, 1);
            printTimes();
        }
    }
    
    function deleteAll() {
        if (confirm("Are you sure you want to delete all your times?")) {
            times = [];
            availablePbls = getSelectedCases();
            updateEOO();
            randomCase();
            printTimes();
        }
    }
    
    // Print all times in the times div
    function printTimes() {
        let timesHtml = "";
        timesHtml += "<p>Times: " + times.length + " (<a href=\"#\" id=\"deleteAll\">clear</a>)</p>";
        timesHtml += "<p>Mean: " + calculateMean(times) + "</p>";
        timesHtml += "<p>Last scramble: " + lastScramble + "<br>Algs:";
        lastCase.algs.forEach(alg => {
            timesHtml += "<br>" + alg.alg + "&nbsp;&nbsp;<span class=\"text-muted\">" + alg.angle + "</span>";
        });
        timesHtml += "</p>";
        for (i = times.length - 1; i >= 0; i--) {
            timesHtml += "<span id=\"t" + i + "\" class=\"deleteTime\">" + times[i].pbl + ": " + times[i].time.toFixed(3) + "</span><br>";
        }
        $("#times").html(timesHtml);
        $("#deleteAll").click(deleteAll);
        $(".deleteTime").click(function(e) {deleteTime(e.target.id)});
    }
    
    randomCase();
});
