function showPlayers() {
	var typedInitials = document.getElementById('initialsInput').value
	var playerList = initialsToPlayers[typedInitials]
	console.log(playerList)
	document.getElementById('matchingPlayersList').innerHTML = playerList
}