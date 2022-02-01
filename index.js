#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import chalkAnimation from "chalk-animation";
import { exec } from 'child_process'
import gradient from 'gradient-string'; 
import figlet from 'figlet'
import { createSpinner } from "nanospinner";

let projectName = "";
let extraPackages = "";

async function welcome() {
    console.clear();

    const msg = `Welcome to SRT`

    figlet(msg, (err, data) => {
        console.log(gradient.pastel.multiline(data))
    })


    await askProjectName();
}

async function askProjectName() {
    setTimeout(async () => {
        const answers = await inquirer.prompt({
            name: 'project_name',
            type: 'input',
            message: 'What do you want to name the project?',
            default() {
                return 'Name'
            },
        });
    
        projectName = answers.project_name;

        await askExtraPackages();
    }, 500)
}

async function askExtraPackages() {
    const answers = await inquirer.prompt({
        name: 'extra_packages',
        type: 'input',
        message: 'Extra packages: ',
        default() {
            return ''
        },
    });

    extraPackages = answers.extra_packages;


    await runCra();
}

async function runCra() {
    const cra = exec(`npx create-react-app ${projectName} --template srt`)
    const spinner = await createSpinner("Creating project..").start();

    async function installOtherPackages() {
        process.chdir(`./${projectName}`)
        const installExtraPackages = await exec(`npm i --save ${extraPackages}`);
    
        installExtraPackages.stderr.on('data', (data) => {
            console.log(data)
        });
    
        installExtraPackages.stdout.on('close', (code) => {
            spinner.success({text: "Successfully created srt project!"})
        });
    }

    cra.stdout.on('data', (data) => {
        spinner.update({text: `${data ? data.split('\n')[0] : `Creating project...`}`})
    })
    
    cra.stderr.on('data', (data) => {
        console.log(data)
        spinner.error({text: data})
        cra.kill();
    });
    
    cra.on('close', async (code) => {
        if(extraPackages.length > 0) {
            spinner.update({text: "Instaling extra packages.."});
            await installOtherPackages();
        }else {
            spinner.success({text: "Successfully created srt project!"})
        }
    });
}

await welcome();
