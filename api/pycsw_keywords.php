<?php

$db = new SQLite3('/usr/share/pycsw/tests/suites/cite/data/ogcwxs.db');

$text = $db->escapeString($_GET['term']);


$query1 = "SELECT distinct keywords, identifier FROM records_wps GROUP BY identifier";


$result1 = $db->query($query1);
$json = '[';
$first = true;
while($row = $result1->fetchArray())
{
	$keywords = explode(",",$row['keywords']);
	$identifiers = $row['identifier'];
	foreach ($keywords as $keyword){
	if ($keyword != ''){
	 if ($keyword != '-'){
		$mdlink = htmlspecialchars('https://bolegweb.geof.unizg.hr/pycsw_wps?service=CSW&version=2.0.2&request=GetRecords&outputSchema=http://www.isotc211.org/2005/gmd&typenames=gmd:MD_Metadata&elementsetname=full&resulttype=results&constraintlanguage=FILTER&constraint=%3Cogc:Filter%20xmlns:ogc%3D%22http://www.opengis.net/ogc%22%3E%3Cogc:PropertyIsEqualTo%3E%3Cogc:PropertyName%3Ecsw:AnyText%3C/ogc:PropertyName%3E%3Cogc:Literal%3E'. $keyword .'%3C/ogc:Literal%3E%3C/ogc:PropertyIsEqualTo%3E%3C/ogc:Filter%3E');
		$query2 = "INSERT INTO keywords VALUES ('$identifiers','$keyword', 'wps', '$mdlink')";
		$db->query($query2);
		echo $keyword.'<br>';
		echo $mdlink.'<br>';
		}
	}	
}
}
?>


