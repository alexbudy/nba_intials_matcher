// called when button is clicked
function showPlayers() {
	var typedInitials = document.getElementById('initialsInput').value
	var playerList = initialsToPlayers[typedInitials]

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

	// clear table first
	$('#playersTable').find("tr:gt(0)").remove();

	// now add rows
	for (var i = 0; i < playerList.length; i++) {
		var player = allPlayers[playerList[i]]
		console.log(player)
		$('#playersTable tr:last').after("<tr><td>" + player[0] +"</td><td>" + 
			player[1] + "</td><td><img height=\"100\" width=\"100\" src=\"http://d2cwpp38twqe55.cloudfront.net/images-011/players/" 
			+ player[9] + "." + player[10] + "\"></td></tr>")
	}
}

