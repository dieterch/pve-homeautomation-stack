import * as m from 'zigbee-herdsman-converters/lib/modernExtend';

export default {
    zigbeeModel: ['BLU Remote Control ZB'],
    model: 'BLU Remote Control ZB',
    vendor: 'Shelly',
    description: 'Automatically generated definition',
    extend: [m.battery(), m.commandsOnOff(), m.commandsLevelCtrl()],
};
