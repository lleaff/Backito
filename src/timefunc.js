
module.exports = {
	cron_s : cron_s,
	cron_h : cron_h,
	cron_m : cron_m	
}

function cron_s(t, callback)
{
	console.log('Backito will back up your files every ', t, ' seconds.');
	setInterval(callback, t * 1000);
}

function cron_m(t, callback)
{
	console.log('Backito will back up your files every ', t, ' minutes.');	
	setInterval(callback, t * 1000 * 60);
}

function cron_h(t, callback)
{
	console.log('Backito will back up your files every ', t, ' hours.');	
	setInterval(callback, t * 1000 * 3600);
}