<?php
//$mysqli = new mysqli('localhost', 'yourUserName', 'yourPassWord', 'yourDatabase');

//$dir = 'sqlite:db/wps.sqlite';
//$dbh  = new PDO('sqlite:/var/www/autocomplete/db/wps.db') or die("cannot open the database");

$db = new SQLite3('/usr/share/pycsw/tests/suites/cite/data/wmts.db');
$text = $db->escapeString($_GET['term']);

$query = "SELECT keywords FROM records WHERE keywords LIKE '%$text%' ORDER BY keywords ASC LIMIT 5";


$result = $db->query($query);
$json = '[';
$first = true;
while($row = $result->fetchArray())
{
	$keywords = explode(",",$row['keywords']);
	foreach ($keywords as $keyword){
    if (!$first) { $json .=  ','; } else { $first = false; }
	
	$json .= '{"value":"'.$keyword.'"}';
	}
	//$json .= '{"value":"'.$row['keywords'].'"}';
	
}
$json .= ']';
echo $json;



?>