
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
        admin_element: null,
        names: [],
        names_out: null,
        admins: [],
        admins_out: null
    },
    name_diff: null,
    admin_diff: null,
    to_remove: [],
    to_lower: [],
    to_higher: [],
    passwords: {},
    pass_btn: null,
    curr_usr: "",
    final_cmd: "",
    needed: [],
    cmd_out: null
}

function copy_usr_cmd(text) {
    navigator.clipboard.writeText("net users");
}

function copy_admin_cmd(text) {
    navigator.clipboard.writeText("net localgroup administrators");
}

function copy_pass() {
    navigator.clipboard.writeText(users.passwords[users.curr_usr]);
}

function copy_final_cmd() {
    navigator.clipboard.writeText(users.final_cmd);
}

function load() {
    setInterval(check, 50);
    users.target.src_element = document.getElementById("in_users");
    users.target.debug_text = document.getElementById("debug_text");

    users.test.cmd_element = document.getElementById("cmd_src");
    users.test.admin_element = document.getElementById("cmd_src_admin");

    users.test.names_out = document.getElementById("cmd-names-out");
    users.test.admins_out = document.getElementById("cmd-admins-out");

    users.admin_diff = document.getElementById("admin-diff");
    users.name_diff = document.getElementById("name-diff");

    users.pass_btn = document.getElementById("copy-pass-btn");

    users.cmd_out = document.getElementById("cmd-out");
}

function check() {
    check_target(users.target);
    users.pass_btn.value = `Copy Password For: ${users.curr_usr}`;
    
    check_cmd_out(users.test);
    catigorize_usrs();

    users.admin_diff.innerText = `TO PROMOTE:\n${users.to_higher.join(" ")}\n\nTO DEMOTE:\n${users.to_lower.join(" ")}`
    users.name_diff.innerText = `TO DELETE:\n${users.to_remove.join(" ")}\n\nTO ADD:\n${users.needed.join(" ")}`

    users.final_cmd = create_cmds();

    users.cmd_out.innerText = users.final_cmd;
}

function catigorize_usrs() {
    users.to_remove = users.test.names.filter(x => !users.target.all_user_names.includes(x));
    users.needed = users.target.all_user_names.filter(x => !users.test.names.includes(x));

    users.to_higher = users.target.admin_names.filter(x => !users.test.admins.includes(x));
    users.to_lower = users.test.admins.filter(x => !users.target.admin_names.includes(x));
}

function create_cmds() {
    let cmds = "echo.";

    for (let user in users.to_higher) {
        cmds += ` & net localgroup administrators /add ${users.to_higher[user]}`;
    }
    for (let user in users.to_lower) {
        cmds += ` & net localgroup administrators /delete ${users.to_lower[user]}`;
    }
    for (let user in users.to_remove) {
        cmds += ` & net user /delete ${users.to_remove[user]}`;
        cmds += ` & rmdir C:\\users\\${users.to_remove[user]} /s /q`;
    }

    return cmds;
}

function check_cmd_out(test) {
    test.names = extract_user_from_net(test.cmd_element.value);
    test.names_out.innerText = "users: " + test.names.join(", ");

    test.admins = extract_user_from_net(test.admin_element.value);
    test.admins_out.innerText = "admins: " + test.admins.join(", ");
}

function extract_user_from_net(out) {
    var usrs = [];
    var lines = out.split("\n");
    while (lines.length && !lines[0].trim().replaceAll("-", "")) {
        lines.splice(0, 1);
    }
    for (let line in lines) {
        if (lines[line].toLowerCase().trim() == "the command completed successfully.".substring(0, lines[line].length)) {
            break;
        }
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
        console.log("val changed");
        return true;
    }
}

function parse_target(target, passwords) {
    var src = target.src;
    
    var names = src.split("\n");
    let pass_header = "password:";
    let admin_header = "authorized administrators:";
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
            split = i;
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