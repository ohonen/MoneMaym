db_readUsers();

function checkUser(form)
{
	if(G_USERS[form.uname.value] == form.pwd.value)
	{
		sessionStorage.User = form.uname.value;
		window.location="MeterSearch.html";				
	}
	else
	{
		alert("שם משתמש או סיסמא שגויים");
	}
}
