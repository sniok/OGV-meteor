Template.registerHelper('embeddedView', function(){
		var url = Router.current().url;
		var parts = url.split('=');
		var shared = parts.pop();
		if(shared == "true"){
			return true;
		}else{
			return false;
		}
	}
);
