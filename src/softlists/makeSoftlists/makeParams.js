'use strict'

const fs        = require('fs')
const XmlStream = require('xml-stream')

module.exports = (mameEmu, hashDir, outputDir, emulator) => {
  
  const //I like forward slashes in system type. System doesn't...
      systemType              = emulator.systemType?
          emulator.systemType.replace(/\//g, `-`) 
        : console.log(`TYPE PROBLEM: ${emulator.displayMachine} doesn't have a system type to use as a potential folder name`) 
      //I like forward slashes in system names. System doesn't...and bloody apple again
      //(The apple specifics are only needed if the machine name is in any way going to be part of the filepath, so a temporary mesaure)
    , displayMachine1         = emulator.displayMachine.replace(/\/\/\//g, `III`)
    , displayMachine2         = displayMachine1.replace(/\/\//g, `II`)
    , displayMachine          = displayMachine2.replace(/\//g, `-`)
    , name1                   = emulator.name.replace(/\/\/\//g, `III`)
    , name2                   = name1.replace(/\/\//g, `II`)

    , name                    = name2.replace(/\//g, `-`)

    , thisEmulator            = emulator
    , stream                  = fs.createReadStream(`${hashDir}${name}.xml`)
    , xml                     = new XmlStream(stream)


    , outRootDir          = `${outputDir}/${mameEmu}_softlists/`
    , outTypePath         = `${outRootDir}/${systemType}`
    , outNamePath         = `${outTypePath}/${name}` //to print out all systems you'd do ${displayMachine}/${name}`/
    , outFullPath         = `${outNamePath}/romdata.dat`
       
  return  ({systemType, name, thisEmulator, stream, xml, outRootDir, outTypePath, outNamePath , outFullPath})

}  
