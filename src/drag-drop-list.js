function Vector2D(x, y) {
	this._x = x || 0;
	this._y = y || 0;
	return {
		X: (v) => { return typeof v !== 'undefined' ? this._x = v : this._x; },
		Y: (v) => { return typeof v !== 'undefined' ? this._y = v : this._y; },
		adds: (sx, sy) => {
			this._x += sx;
			this._y += sy;
		},
		div: (s) => {
			this._x /= s;
			this._y /= s;
		},
		toString: () => { return `X:${this._x} - Y:${this._y}` }
	};
}
Vector2D.diff = (vf, vi) => { return new Vector2D(vf.X() - vi.X(), vf.Y() - vi.Y()); }

const DragDropItem = function({ parent, caption }) {
	const id = (Date.now() * Math.random());
	let el = document.createElement(`li`);
	let elbbox = document.createElement(`div`);
	let dragbtn = document.createElement(`button`);
	let div_top_sensor = document.createElement(`div`);
	let div_bottom_sensor = document.createElement(`div`);
	let div_content = document.createElement(`div`);
	dragbtn.innerHTML = `⇅`;
	el.classList.add(`dragable-item`);
	elbbox.classList.add(`dragable-group`);
	dragbtn.classList.add(`dragable-btn`);
	div_content.classList.add(`dragdrop-item`);
	div_top_sensor.classList.add(`top-space`);
	div_bottom_sensor.classList.add(`bottom-sensor`);

	el.appendChild(div_top_sensor);
	el.appendChild(elbbox);
	elbbox.appendChild(dragbtn);
	elbbox.appendChild(div_content);
	el.appendChild(div_bottom_sensor);

	let drag = false;
	let dir = { x: 0, y: 0 };

	const content = (html) => {
		if (typeof html === `string`)
			div_content.innerHTML = html;
		return div_content.innerHTML;
	}
	const events = () => {
		let mouse_initial = null;
		let el_initial = null;
		let diff_mouse = null;

		let move = { x: 0, y: 0 };

		let loop = null;

		const move_at = (ev) => {
			move.x = ev.clientX - diff_mouse.X();
			move.y = ev.clientY - diff_mouse.Y();
			el.style.left = `${move.x}px`;
			el.style.top = `${move.y}px`;
		}
		const mousedown = (ev) => {
			if (drag) return;
			el.style.zIndex = 1000;
			mouse_initial = new Vector2D(ev.clientX, ev.clientY);
			el_initial = new Vector2D(el.getBoundingClientRect().left, el.getBoundingClientRect().top);
			diff_mouse = Vector2D.diff(mouse_initial, el_initial);
			document.body.style.userSelect = `none`;
			move_at(ev);
			el.style.position = `fixed`;
			drag = true;
			parent.drag_movement(_public);

			document.addEventListener(`mousemove`, mousemove);
		}
		const mouseup = (ev) => {
			drag = false;
			document.removeEventListener(`mousemove`, mousemove);
			parent.drop();
		}
		const mousemove = (ev) => {
			parent.drag_movement(_public);
			move_at(ev);
			dir.x = ev.clientX - mouse_initial.X();
			dir.y = ev.clientY - mouse_initial.Y();
		}

		dragbtn.onmousedown = mousedown;
		dragbtn.onmouseup = mouseup;
	}

	const expand_top_sensor = () => {
		div_top_sensor.style.height = `15px`;
	}
	const contract_top_sensor = () => {
		div_top_sensor.style.height = `0px`;
	}
	const expand_bottom_sensor = () => {
		div_bottom_sensor.style.height = `15px`;
	}
	const contract_bottom_sensor = () => {
		div_bottom_sensor.style.height = `0px`;
	}

	const drop = () => {
		el.style.userSelect = `auto`;
		contract_top_sensor();
		contract_bottom_sensor();

		el.style.position = `initial`;
		document.body.style.userSelect = `initial`;
	}

	content(caption);
	events();

	const _public = {
		id: id,
		item: el,
		space: div_top_sensor,
		content_bbox: div_content,
		content: content,
		expand_top_sensor: expand_top_sensor,
		contract_top_sensor: contract_top_sensor,
		expand_bottom_sensor: expand_bottom_sensor,
		contract_bottom_sensor: contract_bottom_sensor,
		drop: drop,
		dir: () => { return { x: dir.x / Math.abs(dir.x), y: dir.y / Math.abs(dir.y) } },
		rect: () => { return el.getBoundingClientRect(); }
	};

	if (typeof parent !== 'undefined') {
		parent.add_child(_public);
	}

	return _public;
}
//
const DragDropContainer = function({ parent, onChange }) {
	let el = document.createElement(`ul`);
	let selected = ``;
	let initial = -1;
	let end = -1;

	if (typeof parent === 'undefined') return;
	if (typeof parent === 'object')
		parent.appendChild(el);

	let childs = [];

	const add_child = (child) => {
		if (typeof child === 'undefined') return;
		el.appendChild(child.item);
		childs.push(child);
	}

	const drag_movement = (child) => {
		if (typeof child === 'undefined') return;
		child.item.style.userSelect = `none`;
		let rect1 = child.item.getBoundingClientRect();
		rect1.vmiddle = (rect1.bottom + rect1.top) / 2;
		for (let index in childs) {
			index = parseInt(index);
			let c = childs[index];
			if (c.id === child.id) {
				initial = parseInt(index);
				selected = child.id;
				continue;
			}
			c.item.style.userSelect = `none`;
			let rect2 = c.item.getBoundingClientRect();
			rect2.vmiddle = (rect2.bottom + rect2.top) / 2;
			c.contract_top_sensor();
			c.contract_bottom_sensor();
			if (rect1.bottom > rect2.top && rect1.bottom < rect2.bottom && rect1.vmiddle < rect2.vmiddle) {
				c.expand_top_sensor();
			}
			if (rect1.top > rect2.top && rect1.top < rect2.bottom && rect1.vmiddle > rect2.vmiddle) {
				c.expand_bottom_sensor();
			}
		}
	}

	const drop = (child) => {
		let buffer = [];
		for (let c of childs) {
			buffer.push(c);
		}
		for (let i = 0; i < buffer.length; i++) {
			for (let i2 = i + 1; i2 < buffer.length; i2++) {
				let rect1 = buffer[i].rect();
				let rect2 = buffer[i2].rect();
				if (rect1.top + 15 > rect2.top) {
					aux = buffer[i2];
					buffer[i2] = buffer[i];
					buffer[i] = aux;
				}
			}
		}
		for (let index in buffer) {
			const c = buffer[index];
			if (c.id === selected)
				end = parseInt(index);
			c.drop();
		}
		if (typeof onChange === 'function')
			onChange({ original: childs, modified: buffer, origin: initial, target: end });
		initial = -1;
		end = -1;
	}

	let _public = {
		container: el,
		list: () => { return childs; },
		add_child: add_child,
		drag_movement: drag_movement,
		drop: drop
	};
	return _public;
}
//
const DragDropList = function({ name, root, items, css, onChange, onLoad }) {
	if (typeof root === 'string')
		root = document.getElementById(root);
	const root_id = `${root.id} `;
	const container = new DragDropContainer({ parent: root, onChange: onChange, onLoad: onLoad });
	const styles = document.createElement(`style`);
	root.appendChild(styles);
	styles.innerHTML = `
	#${root_id} .dragable-item{
		list-style:none;
	}
	#${root_id} .dragable-group{
		display:flex;
	}
	#${root_id} .dragable-btn{
	    border: 0;
		background-color: rgba(255, 255, 255, 0.8);
		font-size: 13pt;
		cursor: pointer;
		width: 30px;
	}
	#${root_id} .top-space{
		transition: all 0.2s;
		background-color: #EEE;
	}
	#${root_id} .bottom-sensor{
		transition: all 0.2s;
		background-color: #EEE;
	}
	#${root_id} .dragdrop-item
	{
		width: calc(100% - 30px);
	}
	${css || ''} `;

	if (Array.isArray(items)) {
		for (let i of items) {
			new DragDropItem({ parent: container, caption: i.html });
		}
	}
	if (typeof onLoad === `function`)
		onLoad({ target: container.container, items: container.list() });
}
