happyBirthdayIntr = function() {
    var widget = this;
    this.code = null;
    this.settings = {};
    var twig = require('twigjs');
    //функция  ,для перехода в настройки почты при клике на "Перейти к настройкам шаблонов"
    this.emailTemplateEditor = function(){
        yadroFunctions.log('Сработал emailTemplateEditor', 'happy_birthday');
        if (AMOCRM.constant('account').version){
            var link = '/mail/settings/';
        } else {
            var link = '/mail/inbox/';
        }
        AMOCRM.router.navigate(link,{trigger: true})
    }
    //функция открывает модалку Автосмс в маркет плейсе, если Автосмс не подключен, при клике  на "Перейти к настройкам шаблонов"
    this.showDpsms = function(){
        $('.modal-scroller.custom-scroll').trigger('click');
        $('#148').trigger('click');
    }
    //функция для создания нового поля, на случай , если в аккаунте нет ни одного поля с типом День рождения или Дата
    this.createNewField = function(){
        yadroFunctions.log('Сработал createNewField', 'happy_birthday');
        var name = 'День рождения';
        var field_type = 14;
        var data = {
            add: [
                {
                    name: name,
                    field_type: field_type,
                    element_type: 1,
                    origin: 'Introvert',
                    is_editable: 1
                }
            ]
        };
        $.ajax({
            url: '/api/v2/fields',
            method: 'POST',
            data: data,
            success: function (data) {
                yadroFunctions.log('Поле создано', 'happy_birthday');
                yadroFunctions.log(data, 'happy_birthday');
            },
            error: function () {
                yadroFunctions.log('Не удалось создать поле', 'happy_birthday');
            },
            async: false
        });
    }
    this.bind_actions = function(){
        yadroFunctions.log('Сработал bind_action', 'happy_birthday');
        //При клике на элемент списка шаблонов смс , добавляем его в настройки , как выбранный
        $(document).on('click', '.birthday_sms_template_selection', function(e){
            widget.settings.smsTemplate = {
                id: e.currentTarget.dataset.value
            }   
        });
        //Аналогично при клике на шаблон email
        $(document).on('click', '.birthday_email_template_selection', function(e){
            widget.settings.emailTemplate = {
                id: e.currentTarget.dataset.value
            }
        });
        //... и поле
        $(document).on('click', '.birthday_field_selection', function(e){
            widget.settings.field = {
                id: e.currentTarget.dataset.value
            }
        });
        //При клике на "Перейти к настройкам шаблонов" для sms шаблона - создаем открываем модалку автосмс, для email шаблона - перенаправляем в настройки email
        $(document).on('click', '.create_new_email_template', widget.emailTemplateEditor);
        $(document).on('click', '.hb_open_dpsms_modal', widget.showDpsms);
    };

    this.render = function() {

    };
    //в init подключаем файл стилей, проверяем
    this.init = function(){
        $('head').append('<link rel="stylesheet" href="' + yadroFunctions.getBaseUrl() + '/yadrotrue/_widget/happy_birthday/css/main.css">');
        yadroFunctions.log('Сработал init', 'happy_birthday');
    };
    //Шаблоны для смс берем из виджета Автосмс. Не получилось работать с виджетом смс, тк там у шаблонов нет
    // уникальных идентификаторов в настройках
    this.getDataForSmsTemplateList = function(){
        yadroFunctions.log('Сработал getDataForSmsTemplateList', 'happy_birthday');
        var smsSettings = yadroFunctions.getSettings('dpsms');
        var result = [];
        if(smsSettings && smsSettings.frontend_status){
            var templates = smsSettings.sms_templates;
            result.push({
                id: -1,
                option: 'Выберите шаблон СМС',
                class_name: 'hb_list_top_item birthday_sms_template_selection'
            });
            for (var key in templates){
                result.push({
                    id: key,
                    option: templates[key].name,
                    class_name: 'birthday_sms_template_selection'
                })
            }
            result.push({
                    option: 'Перейти к настройке шаблона',
                    class_name: 'hb_open_dpsms_modal control--select--list--item-link'
                })
            return result;
        } else {
            result.push({
                option: 'Выберите шаблон СМС',
                class_name: 'hb_list_top_item'
            });
            result.push({
                option: 'Перейти к настройке шаблона',
                class_name: 'hb_open_dpsms_modal control--select--list--item-link'
            })
            return result;
        }
    }
    //модалка в маркет плэйсе
    this.createPageForMarketPlace = function(obj){
        yadroFunctions.log('Сработал createPageForMarketPlace', 'happy_birthday');
        var set = yadroFunctions.getSettings(widget.code);
        var idSelectedField = set.field.id ? set.field.id : '';
        var idSelectedEmailTemplate = set.emailTemplate.id ? set.emailTemplate.id : '';
        var idSelectedSmsTemplate = set.smsTemplate.id ? set.smsTemplate.id : '';
  
        var fieldSelect = twig({ ref: '/tmpl/controls/select.twig' }).render({
            name: 'select-field',
            selected: idSelectedField,
            items: obj.dataForFieldsList
        });
        var emailTemplateSelect = twig({ ref: '/tmpl/controls/select.twig' }).render({
            name: 'select-field',
            items: obj.dataForEmailTemplateList,
            selected: idSelectedEmailTemplate,
        });

        var smsTemplateSelect = twig({ ref: '/tmpl/controls/select.twig' }).render({
            name: 'select-field',
            items: obj.dataForSmsFieldList,
            selected: idSelectedSmsTemplate
        });
        $('.widget_settings_block__fields').html([
            '<div class="widget_settings_block__comments hb_widget_settings_block__comments">Поле, по которому будет определяться день рождения</div>',
            fieldSelect,
            '<div class="widget_settings_block__comments hb_widget_settings_block__comments">Sms шаблон для поздравления</div>',
            smsTemplateSelect,
            '<div class="widget_settings_block__comments hb_widget_settings_block__comments">Email шаблон для поздравления</div>',
            emailTemplateSelect
        ]);
    }

    //функция для поиска полей через запросы. Вызывается в renderConfig , если не было найдено ни одного поля с типпом
    // День рождения в переменной AMOCRM,тк возможно поле уже было создано, но переменная еще не обновилась
    this.requestForFields = function(){
        yadroFunctions.log('Сработал requestForFields', 'happy_birthday');
        var res;
        $.ajax({
            url: '/api/v2/account',
            method: 'GET',
            data: {
                with: 'custom_fields'
            },
            success: function(response) {
                var fields = response._embedded.custom_fields.contacts;
                var result = [];
                for (let value in fields){
                    if(fields[value].field_type == '14'){
                        result.push({
                            id: fields[value].id,
                            option: fields[value].name,
                            class_name: 'birthday_field_selection'
                        })
                    }
                }
                if (result.length === 0){
                    res = false;
                } else {
                    res = result;
                }
            },
            error: function () {
                yadroFunctions.log('Ошибка при запросе в requestForFields', 'happy_birthday');
            },
            async: false
        });
        return res;
    }
    //функция делает из массива, который приходит при запросе на получение email шаблонов
    // , массив для отрисовки списка
    this.prepareEmailTemplates = function (templates) {
        var dataForEmailTemplateList = [];
        dataForEmailTemplateList.push({
            id: -1,
            option: 'Выберите шаблон для письма',
            class_name: 'hb_list_top_item birthday_email_template_selection'
        });
        for (var i = 0; i < templates.length; i++) {
            dataForEmailTemplateList.push({
                id: templates[i].id,
                option: templates[i].name,
                class_name: 'birthday_email_template_selection'
            })
        }
        dataForEmailTemplateList.push({
            option: 'Перейти к настройке шаблона',
            class_name: 'create_new_email_template control--select--list--item-link'
        })
        return dataForEmailTemplateList;
    }
    this.renderConfig = function() {
        //задаем начальные настройки, если их еще нет
        var settings = yadroFunctions.getSettings(widget.code);
        if (!settings.field || !settings.emailTemplate || !settings.smsTemplate){
            if (!settings.field){
                settings.field = {};
            }
            if (!settings.smsTemplate){
                settings.smsTemplate = {};
            }
            if (!settings.emailTemplate){
                settings.emailTemplate = {};
            }
            yadroFunctions.setSettings(widget.code, settings);
        }
        var obj = {};
        var cf = AMOCRM.constant('account').cf;
        var result = [];
        for (var key in cf) {
            if (cf[key].TYPE_ID == '14' && cf[key].ENTREE_CONTACTS == 1) {
                result.push({
                    id: cf[key].ID,
                    option: cf[key].NAME,
                    class_name: 'birthday_field_selection'
                })
            }
        }
        //если не нашли поля в переменной AMOCRM, то ищем через запрос , если не находим, то создаем, находим через
        // запрос то поле,которое только что создали и добаавляем его в настройки , как выбранное
        var firstElemForFieldsList =  {
            id: -1,
            option: 'Выберите поле',
            class_name: 'hb_list_top_item birthday_field_selection'
        };
        if (!result.length) {
            var fields = widget.requestForFields();
            if (fields === false){
                widget.createNewField();
                fields = widget.requestForFields();
                if (Array.isArray(fields)){
                    fields.unshift(firstElemForFieldsList);
                }
                obj.dataForFieldsList = fields;
                if (Array.isArray(fields) && fields[1] && fields[1].id){
                    yadroFunctions.setSettings(widget.code,
                        {
                            field: {
                                id: fields[1].id
                            }
                        }
                            );
                }
            } else {
                if (Array.isArray(fields)){
                    fields.unshift(firstElemForFieldsList);
                }
                obj.dataForFieldsList = fields;
            }
        }
        else {
            result.unshift(firstElemForFieldsList);
            obj.dataForFieldsList = result;
        }
        var dataForSmsFieldList = widget.getDataForSmsTemplateList();
        obj.dataForSmsFieldList = dataForSmsFieldList;
        var id = AMOCRM.constant('account').id;
        var token = AMOCRM.constant("amomail").auth_token;
        var dataForEmailTemplateList = [];
        $.ajax({
            url: 'https://amomail.amocrm.ru/api/v2/' + id + '/templates',
            success: function (data) {
                dataForEmailTemplateList = data;
            },
            error: function () {
                yadroFunctions.log('При получении email шаблонов произошла ошибка');
            },
            headers: {
                'X-Auth-Token': token,
            },
            async: false
        });
        obj.dataForEmailTemplateList = widget.prepareEmailTemplates(dataForEmailTemplateList);
        widget.createPageForMarketPlace(obj);
    }
    this.saveConfig = function(){
        yadroFunctions.log('сработал saveConfig', 'happy_birthday');
        yadroFunctions.log(widget.settings, 'happy_birthday');
        yadroFunctions.setSettings(widget.code, widget.settings);
    }
    this.bootstrap = function(code) {
        widget.code = code;
        // если frontend_status не задан, то считаем что виджет выключен
        var status = yadroFunctions.getSettings(code).frontend_status;

        if (status) {
            widget.render();
            widget.init();
            widget.bind_actions();
            $(document).on('widgets:load', function () {
                widget.render();
            });
        }
    }
};
yadroWidget.widgets['happy_birthday'] = new happyBirthdayIntr();
yadroWidget.widgets['happy_birthday'].bootstrap('happy_birthday');
