<?php
function check() {
    if (preg_verify($_POST))
    {
        $params = create_tab_params();
        if (!empty($_POST['nb1']))
            $params['n'] = $_POST['nb1'];
        if (!empty($_POST['nb2']))
            $params['k'] = $_POST['nb2'];
        if (!empty($_POST['w']))
    	    $params['w'] = $_POST['w']/4;
        if (!empty($_POST['h']))
            $params['h'] = $_POST['h']/4;
        if ($_POST['degrade'] == "option2")
            $params['degrade'] = 1;
        if ($_POST['color'] != null)
        {
            $rgb = HexToRGB($_POST['color']);
            $params['r'] = $rgb['r'];
            $params['g'] = $rgb['g'];
            $params['b'] = $rgb['b'];
        }  
    return (mandel($params));
    }
    else
        header('Location: ../index.php?error');
}

//Sécurité supplémentaire en PHP pour verifier la validité des données envoyées
function preg_verify($post)
{
    if ((preg_match("/^[0-9]{0,}$/", $post['nb1']) == 1)
    && (preg_match("/^[0-9]{0,}$/", $post['nb2']) == 1)
    && (preg_match("/^[0-9]{0,}$/", $post['w']) == 1)
    && (preg_match("/^[0-9]{0,}$/", $post['h']) == 1))
        return (1);
    else
        return (0);
}