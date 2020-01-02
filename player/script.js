
window.QPlayer = {
	isAuto: true,  // 是否自动播放
	onSetRotate: function () {}
};
(function (q) {
	var
		isRandom = q.isRandom,
		isRotate = q.isRotate;
		
	if (isRandom === undefined)
		isRandom = true;
	
	if (isRotate === undefined)
		isRotate = true;
	
	/**
	 * 变量监听
	 */
	Object.defineProperties(q,{
		isRandom: {
			get: function () {
				return isRandom;
			},
			set: function (bool) {
				isRandom = bool;
				q.history = [q.listIndex];
				q.histIndex = 0;
			}
		},
		isRotate: {
			get: function () {
				return isRotate;
			},
			set: function (bool) {
				isRotate = bool;
				q.onSetRotate(bool);
			}
		}
	});
})(QPlayer);

$(function () {
	/**
	 * 鼠标点击进度
	 * 
	 * @param int
	 */
	function mouseProgress(mouseX) {
		if (isProgressClick){
			var x1 = mouseX - $progress.offset().left;
				x2 = $progress.width();
			if (x1 <= x2)
				$already.width(x1);
			else
				$already.width(x2);
		}
	}
	
	/**
	 * 秒到分钟
	 * 
	 * @param int
	 * @return string eg:"00:00"
	 */
	function sToMin(s) {
		min = parseInt(s/60);
		s = parseInt(s%60);
		if (min < 10)
			min = '0'+min;
		if (s < 10)
			s = '0'+s;
		return min+":"+s;
	}
	
	/**
	 * 是否超过标签
	 * 
	 */
	function isExceedTitle() {
		var width = 0;
		$title.children().each(function () {
			width += $(this).width();
		});
		return width > $title.width();
	}
	
	
	/**
	 * 选择歌词
	 * 
	 * @param int
	 */
	function lyricSelect(index){
		$lyricLi.removeClass('current');
		var $current = $lyricLi.eq(index).addClass('current');
		$lyricOl.stop(true).animate({
			// scrollTop: $current.offset().top-$lyricOl.offset().top+$lyricOl.scrollTop()-($lyricOl.height()-$current.height())/2
		});
	}
	
	/**
	 * HTML转义
	 * 
	 * @param string
	 * @return string
	 */
	function html_encode(str) {
		return str.replace(/[<>&"]/g, function (c) {
			return {
				'<':'&lt;',
				'>':'&gt;',
				'&':'&amp;',
				'"':'&quot;'
			}[c];
		});
	}
	
	/**
	 * 检测列表
	 * 
	 * @return bool
	 */
	function testList() {
		if (q.list.length)
			return true;
		$title.text('没有歌曲');
		$list.html('<li>没有歌曲</li>');
		return false;
	}
	
	var
		$player = $('#QPlayer'),
		$progress = $player.find('.progress'),
		$already = $progress.find('.already'),
		$title = $player.find('.title'),
		$audio = $player.find('audio'),
		$cover = $player.find('.cover img'),
		$timer = $player.find('.timer'),
		$play = $player.find('.play'),
		$more = $player.find('.more'),
		$list = $player.find('.list'),
		$listBtn = $player.find('.list-btn'),
		isLoad = true,  // 是否加载歌曲
		isProgressClick = false,
		q = QPlayer,
		audio = q.audio = $audio[0];
		

		// '../music/许巍-生活不止眼前的苟且.mp3',
		// '../music/邓壬鑫-穿越时空的思念.mp3'
            
    q.list = [
		{
			name: '许巍-生活不止眼前的苟且',
			source: '../music/许巍-生活不止眼前的苟且.mp3',
		},
		{
			name: '邓壬鑫-穿越时空的思念',
			source: '../music/邓壬鑫-穿越时空的思念.mp3'
		}
    ];

    q.load = function (n) {
		if (n < 0 || $listLi.eq(n).hasClass('error')) {
			q.next();
			return true;
		}
		if (n == null)
			return;
		q.listIndex = n
		$listLi.removeClass('current').eq(n).addClass('current');
		var data = q.current = QPlayer.list[n];
		$title.html('<strong>'+ data.name +'</strong>');
		$cover.attr('src', "");  // 小图片
		$already.width('0%');
		$timer.text('00:00');
    }

	/**
	 * 播放
	 * 
	 * @param int
	 */
	q.play = function (n) {
		console.log(n)
		
		$player.addClass('playing');
		if (isLoad) {
			isLoad = false;
			audio.load();
			if (isExceedTitle())
					$title.marquee({
						duration: 15000,
						gap: 50,
						delayBeforeStart: 0,
						direction: 'left',
						duplicated: true
					});
			
            audio.src = '../music/许巍-生活不止眼前的苟且.mp3' //url.replace(/^http:\/\//, 'https://');
            // q.playId = id;
			console.log($player.hasClass('playing'))
			//console.log(audio)
            if ($player.hasClass('playing'))
                audio.play();
		} 
	}
	
	/**
	 * 暂停
	 * 
	 */
	q.pause = function () {
		if (audio.networkState == 3)
			return;
		$player.removeClass('playing');
		audio.pause();
	}
	
	/**
	 * 下一首
	 * 
	 */
	q.next = function () {
		q.histIndex++;
		if (q.histIndex == q.history.length) {
			q.play(random());
			q.history.push(q.listIndex);
		} else
			q.play(q.history[q.histIndex]);
	}
	
	/**
	 * 上一首
	 * 
	 */
	q.last = function () {
		if (q.histIndex === 0) {
			if (q.isRandom)
				q.play(random());
			else if (q.listIndex)
				q.play(q.listIndex-1);
			else
				q.play(q.list.length-1);
			q.history.splice(0,0,q.listIndex);
			q.histIndex = 0;
		} else
			q.play(q.history[--q.histIndex]);
	}
	
	/**
	 * 播放错误
	 * 
	 */
	q.error = function () {
		$listLi.eq(q.listIndex).addClass('error');
		q.history.splice(q.histIndex--, 1);
		q.next();
	}
	
	/**
	 * 设置rotate
	 * 
	 * @param bool
	 */
	q.onSetRotate = function (bool) {
		if (bool) {
			$cover.attr('title', '点击不旋转封面');
			$cover.addClass('rotate');
		} else {
			$cover.attr('title', '点击旋转封面');
			$cover.removeClass('rotate');
		}
    }

	/**
	 * 随机
	 * 
	 * @return int
	 */
	function random() {
		return 0;
	}

    // 获取播放歌单列表
	 //生成播放列表
	function main(){
		for (var i = 0; i < q.list.length; i++) {
			var data = q.list[i];
			//data.name = "许巍-生活不止眼前的苟且"
			$list.append('<li><strong>'+data.name+'</strong></li>');
		}
		
		$listLi = $list.find('li').click(function () {
			var obj = $(this);
			if (!obj.hasClass('error'))
				q.play(obj.index());
		});
		
		//触发监听事件
		q.isRotate = q.isRotate;
		q.isRandom = q.isRandom;
		
		q.listIndex = -1;
		q.histIndex = 0;
		console.log(random(), "p--")
		q.load(random());
		q.history = [q.listIndex];
		if (q.isAuto)  // 是否自动播放
			q.play(random());
	}

	main(); // 入口


	/**
	 * .pop-btn点击
	 */
	$player.find('.pop-btn').click(function () {
		$player.toggleClass('pop');
	});
	
	/**
	 * 进度条按下
	 */
	$progress.mousedown(function (e){
		if (!isProgressClick) {
			isProgressClick = true;
			$player.addClass('unselectable');
			mouseProgress(e.pageX);
		}
	}).on('touchstart', function (e) {
		isProgressClick = true;
		$player.addClass('unselectable');
		mouseProgress(e.originalEvent.changedTouches[0].pageX);
	});
	
	/**
	 * 文档操作
	 */
	$("body")
		.on('mouseup touchend', function () {
			if (isProgressClick) {
				isProgressClick = false;
				$player.removeClass('unselectable');
				if (isNaN(audio.duration))
					$already.width('0');
				else {
					var time = audio.duration*$already.width()/$progress.width();
					audio.currentTime = time;
				}
				
			}
		}).mousemove(function (e) {
			mouseProgress(e.pageX);
		}).on('touchmove',function (e) {
			if (isProgressClick)
				e.preventDefault();
			mouseProgress(e.originalEvent.changedTouches[0].pageX);
		});
	
	/**
	 * .play点击
	 */
	$play.click(function () {
		if (q.list.length)
			if ($player.hasClass('playing')) 
				q.pause();
			else
				q.play();
	});
	
	/**
	 * .next点击
	 */
	$player.find('.next').click(q.next);
	
	/**
	 * .last点击
	 */
	$player.find('.last').click(q.last);
	$audio
		/**
		 * 播放结束
		 */
		.on('ended', q.next)
		
		/**
		 * 播放中
		 */
		.on('playing', function () {
			$player.addClass('playing');
			$title.marquee('resume');
		})
	
		/**
		 * 播放暂停
		 */
		.on('pause', function () {
			$player.removeClass('playing');
			$title.marquee('pause');
		})
		.on('timeupdate', function () {
			$timer.text(sToMin(audio.currentTime));
			if (!isProgressClick)
				$already.width(100*audio.currentTime/audio.duration+"%");
		})
		.on('error', q.error);
	
	$listBtn.click(function () {
		$more.toggleClass('list-show');
	});
	
	$cover.click(function () {
		q.isRotate = !q.isRotate;
	});
	
});