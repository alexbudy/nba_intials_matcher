import urllib.request as ur
from string import ascii_lowercase
from bs4 import BeautifulSoup as BS
import sys
import json
import re

def toConsole(line):
	sys.stderr.write(str(line) + "\n")

def printListWithIndexes(lst):
	s = "\n"
	for i in range(len(lst)):
		s +=  "{}:{}, ".format(str(i+1), lst[i])
	print(s) 

base_url = "http://www.basketball-reference.com/teams/"

teams = ("POR,BOS,SAC,MIL,PHI,HOU,SEA,BUF,CIN,LAL,DEN,VAN," + "ORL,DAL,ATL,GSW,IND,SYR,PIT,BLB,STB,LAC,DET,NYK,WSB,SDR,TOR,PHO," + 
	"SSL,SDA,NJN,MEM,CHH,OKC,CHI,NOJ,KCO,CHA,MIN,MIA,UTA,SAS,INA,NOP,KEN,WAS," + 
	"NOH,CLE,SFW,KCK,FLO,NOK,BRK,OAK,MMF,LAS,DNR,NJA,NYA,MNP,SDC,STL,NYN,MMT," + 
	"PHW,FTW,DTF,BAL,SAA,CHS,PTC,INO,VIR,WSA,WSC,DNN,CHO,CLR,MNL,TRI,DLC,TEX," + 
	"UTS,HSM,ANA,PRO,MLH,CHP,CHZ,PTP,TRH,INJ,AND,WAT,NOB,CAR,DNA,SHE,ROC,MMS,MMP,CAP,MNM,SDS").split(',')

target = open('teams.js', 'w')
target.write("var teamCodesToNames={")
target.close()

codesPrinted = "" # codes for teams printed


# this script needs assistance from user to run to collect all data
for teamCode in teams:
	target = open('teams.js', 'a')
	if teamCode in codesPrinted:
		continue

	teamUrl = base_url + teamCode + "/"
	with ur.urlopen(teamUrl) as url:
		s = url.read()

	teamCodesSet = set()  # this set contains all team codes found on page
	teamNamesSet = set() # this set contains all team names found on page

	soup = BS(s, "html.parser")
	#teamName = soup.findAll('h1')[0].string.replace(" Franchise Index", "")

	for link in soup.findAll('a'):
		linkUrl = re.search(r'/([A-Z]{3})/',link.get('href'))
		if linkUrl != None:
			teamCodesSet.add(str(linkUrl.group(0)).replace('/', ''))


	for row in soup.find_all('div',attrs={"class" : "stw"}):
	    for line in row.text.split('\n'):
	    	if line.startswith('Team Name'):
	    		match = re.match("Team Names?: (.+)", line)
	    		for teamName in match.groups()[0].split(','):
	    			teamNamesSet.add(teamName.strip())

	if len(teamNamesSet) == 1:
		teamCode = list(teamCodesSet)[0]
		codesPrinted += teamCode
		line = teamCode + " : ['" + teamName + "'],"
		toConsole(line)
		target.write(line + '\n')

		continue
	
	teamNamesLst = list(teamNamesSet)
	teamCodesLst = list(teamCodesSet)

	toConsole(teamNamesLst)
	printListWithIndexes(teamCodesLst)

	mainTeamIdx = int(input('Enter code index for main team (one-based): ')) - 1

	for teamName in teamNamesLst:
		printListWithIndexes(teamCodesLst)
		teamIdx = int(input('Enter code index for {} team (one-based): '.format(teamName))) - 1
		thisTeamCode = teamCodesLst[teamIdx]
		if teamIdx == mainTeamIdx:
			line = thisTeamCode + " : ['" + teamName + "'],"
		else:
			line = thisTeamCode + " : ['" + teamName + "', '" + teamCodesLst[mainTeamIdx] + "'],"

		toConsole(line)
		target.write(line + '\n')

		codesPrinted += thisTeamCode


	target.close()

