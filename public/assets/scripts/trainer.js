/* 
PBL Manager
An online tool to store and train Square-1 PBL algs.
v2.0.0

Original author: Charlie Harrison.

Released under the MIT License.
*/

loadPbls(pbls => {
    // Helper function to get a random item from an array
    function choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Display PBL cases in select menu
    pbls.forEach(pbl => {
        $("#caseSelect").append(`<option value="${pbl.top}/${pbl.bottom}">${pbl.top}/${pbl.bottom}</option>`);
    });
    
    // Get PBLs from a list of selected values
    function getPblsFromValues(values) {
        return pbls.filter(pbl => values.includes(pbl.top + "/" + pbl.bottom));
    }
    
    // Update selected cases and random case on select change
    let selectedValues = JSON.parse(localStorage.getItem("selectedValues")) ?? [];
    let selectedPbls = getPblsFromValues(selectedValues);
    selectedValues.forEach(value => {
        $("#caseSelect option[value=\"" + value + "\"]").attr("selected", "");
    });
    $("#caseSelect").change(function() {
        let selectedValues = $(this).val();
        selectedPbls = getPblsFromValues(selectedValues);
        localStorage.setItem("selectedValues", JSON.stringify(selectedValues));
        randomCase();
    });
    
    // Random case/scramble
    let currentCase, currentScramble, lastCase, lastScramble;
    function randomCase() {
        if (selectedPbls.length > 0) {
            const flip = ["", "flip "];
            const auf = ["", "U ", "U' ", "U2 "];
            const adf = ["", "D ", "D' ", "D2 "];
            currentCase = choice(selectedPbls);
            currentScramble = choice(flip) + choice(auf) + choice(adf) + currentCase.setup + " " + choice(auf) + choice(adf);
            $("#scramble").html(currentScramble);
        } else {
            $("#scramble").html("Please select some cases first.");
        }
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
