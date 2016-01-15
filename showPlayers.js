hideTable()

// restrict input
$(document).ready(function() {
    $('#initialsInput').keypress(function(key) {
    	var typed = $('#initialsInput').val() +  String.fromCharCode(key.keyCode)
    	if (typed.length == 0) return;
        var re = /^[A-Z],?[A-Z]?$/i;
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
function showPlayers() {
	var typedInitials = document.getElementById('initialsInput').value.replace(',', '').toUpperCase()
	var playerList = initialsToPlayers[typedInitials]

	if (playerList == null || playerList.length == 0) {
		hideTable()
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
	return "<td><a href=\"" + url + "\">" + img + player[0] + " " + player[1] + "</a></td>"
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
	return "<td>" + player[4] + " " + player[5] + "/" + player[6] + "</td>"
}

function genTeamsPlayedOn(player) {
	s = "<td>"
	for (var i = 0; i < player[12].length; i++) {
		s += teams[player[12][i]][0] + "<br>"
	}
	s += "</td>"
	return s
}

function genPlayerImgCell(player) {
	if (player[10] != null) {
		return "<td><img src=\"http://d2cwpp38twqe55.cloudfront.net/images-011/players/" 
			+ player[9] + "." + player[10] + "\"></td>"
	} else {
		return "<td></td>"
	}
}