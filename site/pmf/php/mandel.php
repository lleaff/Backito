<?php

function mandel($params)
{
    $image_x = 4*$params['w'];
    $image_y = 4*$params['h'];
    $image = imagecreatetruecolor($image_x, $image_y);
    imagefilledrectangle($image, 0, 0, $image_x, $image_y, 0xFFFFFF);
    $f = imagecolorallocate($image, $params['r'], $params['g'], $params['b']);
    $color = color($params, $image);
    for ($x = 0; $x < $image_x; $x++)
    {
        for ($y = 0; $y < $image_y; $y++)
        {
            $c_r = $x/$params['w']+-2;
            $c_i = $y/$params['h']+-2;
            $z_r = 0;
            $z_i = 0;
            $i   = 0;
            while ($z_r*$z_r + $z_i*$z_i < 4 AND $i < $params['n'])
            {
                $mod = sqrt(($z_r * $z_r) + ($z_i * $z_i));
                $arg = atan2($z_i, $z_r);
                $z_r = pow($mod, $params['k']) * cos($params['k'] * $arg) + $c_r;
                $z_i =  pow($mod, $params['k']) * sin($params['k'] * $arg) + $c_i;
                $i++;
            }
            if ($i == $params['n'])
                imagesetpixel($image, $x, $y, $f);
            else
                imagesetpixel($image, $x, $y, $color[$i]);
        }
    }
   return (send_image($image));
}

function color($params, $image)
{
    $color = array();
    for ($i = 0; $i < $params['n']; $i++)
        if ($params['degrade'] == 0)
            $color[$i] = imagecolorallocate($image,0,$i*255/$params['n'],$i*255/$params['n']);
        else
            $color[$i] = imagecolorallocate($image,255,255,255);
    return ($color);
}

function send_image($image)
{
   ob_start();
   imagepng($image);
   $data = base64_encode(ob_get_clean());
   return ($data);
}
