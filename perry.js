
var users = {
    target: {
        src: "",
        src_element: null,
        admin_names: [],
        auth_user_names: [],
        all_user_names: [],
        debug_text: null,
        entred: false
    },
    test: {
        cmd_element: null,
        cmd_result: "",
        names: [],
        admins: []
    },
    to_remove: [],
    to_lower: [],
    to_higher: [],
    passwords: {},
    curr_usr: "",
    needed: []
}

function copy_usr_cmd(text) {
    navigator.clipboard.writeText("net users");
}

function copy_admin_cmd(text) {
    navigator.clipboard.writeText("net localgroup administrators");
}

function load() {
    setInterval(check, 50);
    users.target.src_element = document.getElementById("in_users");
    users.target.debug_text = document.getElementById("debug_text");

    users.test.cmd_element = document.getElementById("cmd_src");
}

function check() {
    check_target(users.target);
    check_cmd_out(users.test);
    create_cmds();
}

function create_cmds() {

}

function check_cmd_out(test) {
    test.names = extract_user_from_net(test.cmd_result);
    test.admins = extract_user_from_net()
}

function extract_user_from_net(out) {
    var usrs = [];
    var lines = out.split("\n");
    while (!lines[0].trim().replaceAll("-", "")) {
        lines.splice(0, 1);
    }
    for (let line in lines) {
        var name = lines[line].slice(0, 24).trim();
        if (name) {
            usrs.push(name);
        }
        var name = lines[line].slice(25, 49).trim();
        if (name) {
            usrs.push(name);
        }
        var name = lines[line].slice(50).trim();
        if (name) {
            usrs.push(name);
        }
    }
    let final = [];
    for (let usr in usrs) {
        if (!["WDAGUtilityAccount", "Administrator", "DefaultAccount", "Guest"].includes(usrs[usr])) {
            final.push(usrs[usr]);
        }
    }
    return final;
}

function change_cmd(test) {
    if (test.cmd_element.value != test.cmd_result) {
        test.cmd_result = test.cmd_element.value;
        return true;
    }
    return false;
}

function check_target(target) {
    if (change_src(target)) {
        parse_target(target, users.passwords);
    }
}

function change_src(target) {
    let val = target.src_element.value;
    if (target.src == val) {
        return false;
    } else {
        target.src = val;
        console.log("val changed")
        return true;
    }
}

function parse_target(target, passwords) {
    var src = target.src;
    
    var names = src.split("\n");
    let pass_header = "password:";
    let admin_header = "authorized administrators:"
    let split;
    console.log(names);

    let i = 0;
    while (i < names.length) {
        let name = names[i].trim();
        let lo = name.toLowerCase();
        let passwd;
        if (name.includes(pass_header)) {
            [name, passwd] = name.split(pass_header, 2);
            name = name.trim();
            passwd = passwd.trim();
            if (name) {
                passwords[name] = passwd;
                names[i] = name;
                i++;
            } else {
                passwords[names[i-1]] = passwd;
                names.splice(i, 1);
            }
        } else if (lo.includes("authorized users:")) {
            names.splice(i, 1);
            split = i - 1;
        } else if (lo == admin_header.slice(admin_header.length - lo.length)) {
            names.splice(i, 1);
        } else if (name) {
            if (name.endsWith("(you)")) {
                name = name.substring(0, name.length - 6).trim();
                users.curr_usr = name;
            }
            names[i] = name;
            i++;
        }
    }
    var admins = names.slice(0, split);
    var usrs = names.slice(split, -1);
    target.entered = !!names;
    debug_msg(target.debug_text, "Auth Users: " + usrs.join(", ") + "\n Admins: " + admins.join(", "));
    target.admin_names = admins;
    target.auth_user_names = usrs;
    target.all_user_names = names;
}

function debug_msg(element, msg) {
    element.innerText = msg;
}