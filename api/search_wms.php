<?php
//$mysqli = new mysqli('localhost', 'yourUserName', 'yourPassWord', 'yourDatabase');

//$dir = 'sqlite:db/wps.sqlite';
//$dbh  = new PDO('sqlite:/var/www/autocomplete/db/wps.db') or die("cannot open the database");

$db = new SQLite3('/usr/share/pycsw/tests/suites/cite/data/wms.db');
$text = $db->escapeString($_GET['term']);

$query = "SELECT distinct (keywords) FROM records WHERE keywords LIKE '%$text%' ORDER BY keywords ASC LIMIT 5";


$result = $db->query($query);
$json = '[';
$first = true;
while($row = $result->fetchArray())
{
	$keywords = explode(",",$row['keywords']);
	//$count = 10;
	foreach ($keywords as $keyword){
    if (!$first) { $json .=  ','; } else { $first = false; }
	
	$json .= '{"value":"'.$keyword.'"}';
	//if(count <=0)
	 //break; //will break if statement and foreach

	 //$count--; // reduce it by one
	
	}
	//$json .= '{"value":"'.$row['keywords'].'"}';
	
}
$json .= ']';
echo $json;



?>