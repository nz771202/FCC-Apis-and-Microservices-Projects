
function ExerciseTracker($container)
{
	const me = this;
	const $info = $container.find('#et_info');
	const $loading = $container.find('#et_loading');
	const $newUserForm = $container.find('form#et_newUser');
	const $addExcsForm = $container.find('form#et_addExercise');
	const $getLogForm = $container.find('form#et_getLog');
	const $listUsers = $container.find('#et_listUsers');

	$newUserForm.submit(function() {
		$loading.show();
		$.post('/api/exercise/new-user', $(this).serialize(), (data) => {
			$loading.hide();
			$info.text(JSON.stringify(data, null, 4));
			$addExcsForm.find('input[name="userId"]').val(data._id);
			$getLogForm.find('input[name="userId"]').val(data._id);
		}, 'json');
		return false;
	});

	$addExcsForm.submit(function() {
		$loading.show();
		$.post('/api/exercise/add', $(this).serialize(), (data) => {
			$loading.hide();
			$info.text(JSON.stringify(data, null, 4));
		}, 'json');
		return false;
	});

	$getLogForm.submit(function() {
		$loading.show();
		$.getJSON('/api/exercise/log?' + $(this).serialize(), (data) => {
			$loading.hide();
			$info.text(JSON.stringify(data, null, 4));
		});
		return false;
	});

	$listUsers.click(function() {
		$loading.show();
		$.getJSON('/api/exercise/users', (data) => {
			$loading.hide();
			$info.text(JSON.stringify(data, null, 4));
		});
		return false;
	});
}

$(document).ready(function() {
	new ExerciseTracker($('#exercise-tracker'));
});
