hideTable()


var re = /^[A-Z*],?[A-Z*]?$/i;
var re2 = /^[A-Z*],?[A-Z*]$/i;

// restrict input
$(document).ready(function() {
	var search = window.location.search

	if (search.length > 0) {
		var kv = search.substr(1).split('=')
		if (kv.length==2 && kv[0] == 'initials') {
			if (re2.exec(kv[1]) != null) {
				$('#initialsInput').val(kv[1])
				showPlayers(false)
			} else {
				window.location.search = ""
			}
		}
	}

    $('#initialsInput').keypress(function(key) {
    	var typed = $('#initialsInput').val() +  String.fromCharCode(key.keyCode)
    	if (typed.length == 0) return;
        if (re.exec(typed) == null) return false;
    })
});

$('#initialsInput').on('keyup', function(e) {
    if (e.keyCode === 13) {
        $('#submitBtn').click();
    }
});

function hideTable() {
	$('#playersTable').hide()
}

// called when button is clicked
function showPlayers(setURL) {
	var enteredInits = document.getElementById('initialsInput').value.toUpperCase()
	var typedInitials = enteredInits.replace(',', '')

	if (typedInitials.length != 2) {
		hideTable()
		$('#noMatchingPlayers').html('Please enter two characters')

		return
	}

	if (typedInitials == "**") {
		hideTable()
		
		$('#noMatchingPlayers').html('Only one wildcard (*) character with a letter is permitted')

		return
	}

	if (setURL) {
		window.location.assign("nba_initials.html?initials=" + enteredInits)
	}


	var playerList = playersFromInitials(typedInitials)

	if (playerList == null || playerList.length == 0) {
		hideTable()

		
		$('#noMatchingPlayers').html('There are no matching NBA players for those initials :(')

		return
	}

	playerList.sort(function(first, second) {
		var p1 = allPlayers[first]
		var p2 = allPlayers[second]

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
	s = "<tr>" + genFullNameCell(player) + genYrsPlayedCell(player) +
	genPlayerStats(player) + genSimpleCell(player, 8) +	
	genTeamsPlayedOn(player) + genSimpleCell(player, 11) + "</tr>"
	return s
}

function genFullNameCell(player) {
	var url = 'http://www.basketball-reference.com/players/' + player[9][0] + "/" + player[9] + ".html"
	if (player[10] != null) {
		img = "<img src=\"http://d2cwpp38twqe55.cloudfront.net/images-011/players/" 
			+ player[9] + "." + player[10] + "\"><br>"
	} else {
		img  = ""
	}
	return "<td><a class=\"playerLinks\" href=\"" + url + "\">" + img + player[0] + " " + player[1] + "</a></td>"
}

function genYrsPlayedCell(player) {
	return "<td>" + player[2] + " - " + player[3] + "</td>"
}

function genSimpleCell(player, idx) {
	if (player[idx] == null) {
		return "<td></td>"
	} else {
		return "<td>" + player[idx] + "</td>"
	}
}

function genPlayerStats(player) {
	return "<td class=\"playerStatsCells\">" + player[4] + " " + player[5] + "/" + player[6] + "</td>"
}

function genTeamsPlayedOn(player) {
	s = "<td class=\"teamsPlayedOnCells\">"
	for (var i = 0; i < player[12].length; i++) {
		s += teams[player[12][i]][0] + "<br>"
	}
	s += "</td>"
	return s
}
