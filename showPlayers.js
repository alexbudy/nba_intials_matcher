hideTable()


var re = /^[A-Z*],?[A-Z*]?$/i;
var re2 = /^[A-Z*],?[A-Z*]$/i;

String.prototype.replaceBetween = function(start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
};

function setUrlWithInitials() {
	var search = window.location.search

	if (search.length > 0) {
		var kv = search.substr(1).split('=')
		if (kv.length==2 && kv[0] == 'initials') {
			if (kv[1].toUpperCase() == $('#initialsInput').val().toUpperCase()) {
				return
			}
		}
	}

	window.location.assign("nba_initials.html?initials=" + $('#initialsInput').val())
}

// restrict input
$(document).ready(function() {
	var search = window.location.search

	if (search.length > 0) {
		var kv = search.substr(1).split('=')
		if (kv.length==2 && kv[0] == 'initials') {
			$('#initialsInput').val(kv[1])
			showPlayers()
		} else if (kv.length==2 && kv[0] == 'breakdown') {
			runFreqBreakdown(kv[1])
		} else if (kv.length==2 && kv[0] == 'school') {
			runSchoolBreakdown(kv[1])
		}

	}

    $('#initialsInput').keypress(function(key) {
    	var initialsBox = $('#initialsInput')
    	var sStart = initialsBox[0].selectionStart
    	var sEnd = initialsBox[0].selectionEnd 
    	var typed = initialsBox.val() +  String.fromCharCode(key.charCode)

    	if (sStart != sEnd) {
    		typed = initialsBox.val().replaceBetween(sStart, sEnd, String.fromCharCode(key.charCode))
    	} 

    	if (typed.length == 0) return;
        if (re.exec(typed) == null) return false;
    })
});

$('#initialsInput').on('keyup', function(e) {
    if (e.keyCode === 13) {
        $('#submitBtn').click();
    }
});


$('.breakdowns').on('click', function(e) {
	window.location.assign("nba_initials.html?breakdown=" + e.target.id);	
})

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function runSchoolBreakdown(school) {
	var schoolKey = school.replaceAll("_", " ")
	console.log(schoolKey)
	
	var players = []
	for (var i = 0; i < allPlayers.length; i++) {
		var playerSchool = allPlayers[i][8]
		if (playerSchool == null) {
			continue
		} else {
			playerSchool = playerSchool.replaceAll("'", "").replaceAll(".", "")
		}

		if (playerSchool.toUpperCase() == schoolKey.toUpperCase()) {
			players.push(i)
		}
	}

	showPlayerTable(players)

	$('#numberMatchingPlayers').html(players.length + ' matching players found')
}

// possible breakdowns: initials, school
function runFreqBreakdown(breakdown) {
	hideTable();
	$('#numberMatchingPlayers').hide()
	
	$('#breakdownTable').find("tr").remove();
	
	if (breakdown == 'breakdownInitials') {
		$('#breakdownTable').append("<tr><td colspan=\"2\">Initial Counts of all NBA Players, Past and Present</td></tr>")

		var counts = {}
		for (key in initialsToPlayers) {
			counts[key] = initialsToPlayers[key].length
		}

		// Create items array
		var items = Object.keys(counts).map(function(key) {
		    return [key, counts[key]];
		});

		// Sort the array based on the second element
		items.sort(function(first, second) {
		    return second[1] - first[1];
		});

		for (var i = 0; i < items.length; i++) {
			var initials = items[i][0]
			var count = items[i][1]
			var row = "<tr><td><b>";
			row += "<a href=\"./nba_initials.html?initials=" + initials + "\">" + initials + "</a>"
			row += "</b></td><td> " + genStringBar(count) + "</td></tr>"
			$('#breakdownTable').append(row)
		}
	} else if (breakdown == 'breakdownSchools') {
		$('#breakdownTable').append("<tr><td colspan=\"2\">Schools by Number of NBA Players Attended, Past and Present</td></tr>")
		var counts = {}

		for (id in allPlayers) {
			var school = allPlayers[id][8]
			if (school in counts) {
				counts[school]++;
			} else {
				counts[school] = 1;
			}
		}

		// Create items array
		var items = Object.keys(counts).map(function(key) {
		    return [key, counts[key]];
		});

		// Sort the array based on the second element
		items.sort(function(first, second) {
		    return second[1] - first[1];
		});

		for (var i = 0; i < items.length; i++) {
			var school = items[i][0]
			if (school == 'null') continue
			var count = items[i][1]
			var row = "<tr><td><b><a href=\"./nba_initials.html?school=" + school.replaceAll(" ", "_").replaceAll("'","").replaceAll(".", "") + "\">" + school + "</a>";
			row += "</b></td><td> " + genStringBar(count) + "</td></tr>"
			$('#breakdownTable').append(row)
		}
	}
	$('#breakdownTable').show()
}

// returns bar of length len, with number appended at end.  Ex:
// ||||| 5
function genStringBar(len) {
	return Array(len+1).join('-') + " <b>" + len + "</b>" 
}

function hideTable() {
	$('#playersTable').hide()
}

function showTable() {
	$('#breakdownTable').hide()
	$('#numberMatchingPlayers').show()
	$('#playersTable').show()
}

// called when button is clicked
function showPlayers() {
	var enteredInits = document.getElementById('initialsInput').value.toUpperCase()
	var typedInitials = enteredInits.replace(',', '')

	$('#numberMatchingPlayers').show()
	if (typedInitials.length != 2) {
		hideTable()
		$('#numberMatchingPlayers').html('Please enter two characters')
		return
	}

	if (typedInitials == "**") {
		hideTable()
		$('#numberMatchingPlayers').html('Only one wildcard (*) character with a letter is permitted')

		return
	}


	var playerList = playersFromInitials(typedInitials)

	if (playerList == null || playerList.length == 0) {
		hideTable()
		$('#numberMatchingPlayers').html('There are no matching NBA players for those initials :(')

		return
	}

	$('#numberMatchingPlayers').html(playerList.length + ' matching players found')

	showPlayerTable(playerList)
}

function showPlayerTable(playerList) {
	if (playerList.length > 1) {
		playerList.sort(function(first, second) {
			var p1 = allPlayers[first]
			var p2 = allPlayers[second]
			console.log(p1)
			var firstScore = p1[11]
			var secondScore = p2[11]

			if (p1[10] != null) { // allows me to sort on two variables - might be better way
				firstScore += 1000000
			}

			if (p2[10] != null) {
				secondScore += 1000000
			}

			return secondScore - firstScore
		});
	}
	
	$('#playersTable').show()
	// clear table first
	$('#playersTable').find("tr:gt(0)").remove();

	// now add rows
	for (var i = 0; i < playerList.length; i++) {
		var player = allPlayers[playerList[i]]
		$('#playersTable tr:last').after(genRowStr(player))
	}
}

// take into account wildcards
// acceptable inputs: *B, B*, AB
// not acceptable: *, ** -- caught before function
function playersFromInitials(initials) {
	if (initials == '**' || initials == '*') {
		return
	}

	var wildCardIdx = initials.indexOf('*')
	if (wildCardIdx == -1) {
		return initialsToPlayers[initials]
	} else { 
		var allPlayers = []
		var letters = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("")
		if (wildCardIdx == 0) { // means input is ex: *B
			for (var i = 0; i < letters.length; i++) {
				var playerSubset = initialsToPlayers[letters[i] + initials[1]]
				allPlayers = allPlayers.concat(playerSubset)
			}

		} else { // input ex: B*
			for (var i = 0; i < letters.length; i++) {
				var playerSubset = initialsToPlayers[initials[0] + letters[i]]
				allPlayers = allPlayers.concat(playerSubset)
			}
		}

		return allPlayers
	}

}

function genRowStr(player) {
	var bold = false;
	if (player[3] == 2016) {
		bold = true;
	}
	return "<tr>" + genFullNameCell(player, bold) + genYrsPlayedCell(player, bold) +
	genPlayerStats(player, bold) + genSchoolCell(player) +	
	genTeamsPlayedOn(player, bold) + getTotalPtsCell(player, bold) + "</tr>"
}

function genFullNameCell(player, bold) {
	var url = 'http://www.basketball-reference.com/players/' + player[9][0] + "/" + player[9] + ".html"
	if (player[10] != null) {
		img = "<img class= \"playerImage\" src=\"http://d2cwpp38twqe55.cloudfront.net/images-011/players/" 
			+ player[9] + "." + player[10] + "\"><br>"
	} else {
		img  = ""
	}
	if (bold) {
		return "<td>" + img + "<a class=\"playerLinks\" href=\"" + url + "\"><b>" + player[0] + " " + player[1] + "</b></a></td>"
	} else {
		return "<td>" + img + "<a class=\"playerLinks\" href=\"" + url + "\">" + player[0] + " " + player[1] + "</a></td>"
	}
}

function genYrsPlayedCell(player, bold) {
	if (bold) {
		return "<td><b>" + player[2] + " - " + player[3] + "</b></td>"
	} else {
		return "<td>" + player[2] + " - " + player[3] + "</td>"
	}
}

function getTotalPtsCell(player, bold) {
	if (bold) {
		return "<td><b>" + player[11] + "</b></td>"
	} else {
		return "<td>" + player[11] + "</td>"
	}
}

function genPlayerStats(player, bold) {
	if (bold) {
		return "<td class=\"playerStatsCells\"><b>" + player[4] + " " + player[5] + "/" + player[6] + "</b></td>"
	} else {
		return "<td class=\"playerStatsCells\">" + player[4] + " " + player[5] + "/" + player[6] + "</td>"
	}
}

function genSchoolCell(player) {
	if (player[8] == null) {
		return "<td></td>"
	} else {
		var schoolurl = "./nba_initials.html?school=" + player[8].replaceAll(" ", "_").replaceAll("'","").replaceAll(".", "")
		var schoolLinkTag = "<a class=\"schoolUrlClass\" href=\"" + schoolurl + "\">" + player[8] + "</a>"
		return "<td>" + schoolLinkTag + "</td>"
	}
} 

function genTeamsPlayedOn(player, bold) {
	s = "<td class=\"teamsPlayedOnCells\">"
	for (var i = (player[12].length - 1); i >= 0; i--) {
		if (false && i == (player[12].length - 1)) { // not sure which team is active team for each player, so ignore bold for now
			s += "<b>" + teams[player[12][i]][0] + "</b><br>"
		} else {
			s += teams[player[12][i]][0] + "<br>"
		}
	}
	s += "</td>"
	return s
}
