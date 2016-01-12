import urllib.request as ur
from string import ascii_lowercase
from bs4 import BeautifulSoup as BS
import sys
import json
import re

'''
This script generates all player data into a javascript table
var allPlayers = []
				First, Last, Start, To, Pos, Ht, Birth, College, playerid, img type = jpg/png/null, careerpts
allPlayers[0] = ['Kobe', 'Bryant', 1997, 2016, 'G-F', '6-6', 212, 'August 23, 1978', None, 'bryanko01']
allPlayers[1] = ['LeBron', 'James', 2004, 2016, 'F-G', '6-8', 250, 'December 30, 1984', None, 'jamesle01']
'''

base_url = 'http://www.basketball-reference.com' # append letter from 'a' to 'z'
base_img_url = 'http://d2cwpp38twqe55.cloudfront.net/images-011/players/' #all players have this base url + player id + .jpg or .png
def getImgUrlTotalPtsTeamsPlayedFromPlayerUrl(playerId):
	playerPageUrl = base_url + '/players/' + playerId[0] + '/' + playerId + '.html'
	with ur.urlopen(playerPageUrl) as playerurl:
		s = playerurl.read()

	soup = BS(s, "html.parser")

	sources = [x['src'] for x in soup.findAll('img') if re.search(playerId, x['src'])]
	if len(sources) > 0:
		imgtype = json.dumps(sources[0][-3:]) # returns either png or jpg, since base urls are same
	else:
		imgtype = 'null'

	totalsTable = soup('table', {'id' : 'totals'})[0]
	careerTotalTds = totalsTable.tfoot('tr')[0]('td')
	pts = careerTotalTds[-1].string

	teamsRows = totalsTable.tfoot('tr')
	allTeams = []
	for idx in range(2, len(teamsRows)):
		team = teamsRows[idx]('td')[2].string
		if team == None:
			continue
		allTeams.append(team)

	#special case
	if len(allTeams) == 0:
		team = totalsTable.tbody('tr')[-1]('td')[2].string
		if team == None:
			continue
		allTeams.append(team)

	return [imgtype, pts, allTeams]


			# 'First', 'Last', Start, To, 'Pos', 'Ht', Wt, 'Birthdate', College, 'url', 'img url', careerpts, 'teams'
templateOrig = "[{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11}, {12}]," # <- this one is fastest for js to initialize

print("var start = new Date().getTime();")
print("var allPlayers = [")
playerIdx = 0  # this index corresponds with id of allPlayers JS dictionary

for c in ascii_lowercase:
	url = base_url + '/players/' + c
	with ur.urlopen(url) as url:
		s = url.read()

	soup = BS(s, "html.parser")

	try:
		for row in soup('table', {'id' : 'players'})[0].tbody('tr'):
			tds = row('td')
			fullname = json.dumps(tds[0].a.string).replace("\"", "").split()  # First Last
			
			firstname =  json.dumps(fullname[0])
			lastname = json.dumps(fullname[1])

			playerId = re.findall('\/([a-zA-Z0-9]*)\.html', tds[0].a['href'])[0] #ex: lambje01, jamesle01
			yrFrom = tds[1].string 
			yrTo = tds[2].string
			pos = tds[3].string
			ht = tds[4].string
			wt = tds[5].string
			birthdate = tds[6].string
			college = tds[7].string
			playerImgType, careerPts, teamsPlayedOn = getImgUrlTotalPtsTeamsPlayedFromPlayerUrl(playerId)

			if (yrFrom == None):
				yrFrom = 'null'
			if (yrTo == None):
				yrTo = 'null'
			if (pos == None):
				pos = 'null'
			else:
				pos = json.dumps(pos)
			if (ht == None):
				ht = 'null'
			else:
				ht = json.dumps(ht)
			if (wt == None):
				wt = 'null'
			if (college == None):
				college = 'null' # for JS purposes
			else:
				college = json.dumps(college)

			if (birthdate == None): #assume if birthdate not listed then player is not well known
				continue
			else:
				birthdate = json.dumps(birthdate)

			playerId = json.dumps(playerId)

			# 'First', 'Last', Start, To, 'Pos', 'Ht', Wt, 'Birthdate', College, 'url'
			#template = "allPlayers[{0}]= [   {1}, {2}, {3}, {4}, '{5}', '{6}', {7}, '{8}', {9}, '{10}']"
			#templatePush = "allPlayers.push([{0}, {1}, {2}, {3}, '{4}', '{5}', {6}, '{7}', {8}, '{9}'])"

			# experimented with push() vs index - time & see difference - fastest by far is direct initialization - just a few ms

			line = templateOrig.format(firstname, lastname, yrFrom, yrTo, pos, ht, wt, birthdate, 
				college, playerId, playerImgType, careerPts, str(teamsPlayedOn))
			print(line)
			sys.stderr.write(str(playerIdx) + ": " + line + "\n")

			playerIdx += 1
			#if (playerIdx >= 2):
			#	sys.exit(0)
	except IndexError:
		continue

print("]")
print("var end = new Date().getTime();")
print("var time = end - start;")
print("alert('Execution time: ' + time);")


