$(document).ready(function () {

    function getIdSelections() {
        return $.map($("#table").bootstrapTable('getSelections'), function (row) {
            return row.id
        })
    }

    function responseHandler(res) {
        $.each(res.rows, function (i, row) {
            row.state = $.inArray(row.id, selections) !== -1
        })
        return res
    }

    function detailFormatter(index, row) {
        var html = []
        $.each(row, function (key, value) {
            html.push('<p><b>' + key + ':</b> ' + value + '</p>')
        })
        return html.join('')
    }

    function operateFormatter(value, row, index) {
        return [
            '<a class="edit" href="javascript:void(0)" title="Edit">',
            '<i class="fa fa-edit"></i>',
            '</a>  ',
            '<a class="remove" href="javascript:void(0)" title="Remove">',
            '<i class="fa fa-trash"></i>',
            '</a>'
        ].join('')
    }

    window.operateEvents = {
        'click .edit': function (e, value, row, index) {
            $(".modal-title").text('Row Detail');
            var formToShow = '<form>'
            var ind = 1;
            for (var key in row) {
                if (key == 'state') 
                    continue;
                formToShow = formToShow + '<div class="form-group row">';
                formToShow = formToShow + '<label id="ModalHeader_' + ind + '" for="' + key + '" class="col-sm-2 col-form-label">' +
                        key + '</label><div class="col-sm-10">';
                if (key == 'id') {
                    formToShow = formToShow + '<input type="text" class="form-control" id="ModalFie' +
                            'ld_' + ind + '" placeholder="' + key + '" value="' + index + '" readonly';
                } else {
                    formToShow = formToShow + '<input type="text" class="form-control" id="ModalFie' +
                            'ld_' + ind + '" placeholder="' + key + '" value="' + row[key] + '" ';
                }
                formToShow = formToShow + '>';
                formToShow = formToShow + '</div></div>';
                ind += 1;
            }
            formToShow = formToShow + '<form>';

            $('#detailsModal')
                .modal('show')
                .find('.modal-body')
                .html(formToShow);
        },
        'click .remove': function (e, value, row, index) {
            $table.bootstrapTable('remove', {
                field: 'id',
                values: [row.id]
            })
        }
    }

    function totalTextFormatter(data) {
        return 'Total'
    }

    function totalNameFormatter(data) {
        return data.length
    }

    function totalPriceFormatter(data) {
        var field = this.field
        return '$' + data
            .map(function (row) {
                return + row[field].substring(1)
            })
            .reduce(function (sum, i) {
                return sum + i
            }, 0)
    }

    // Function sum numeric fields
    function totalNumFormatter(data) {
        var field = this.field
        return data
            .map(function (row) {
                var valueField = row[field].replace(',', '.');;
                if ($.isNumeric(valueField) == false) 
                    return + '0';
                return + valueField
            })
            .reduce(function (sum, i) {
                return sum + i;
            }, 0)
    }

    function initTable(colsHeaders) {
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            height: screen.height/1.5,
            locale: 'en-US',
            columns: colsHeaders,
            onRefresh: function (params) {
                loadFileCSV()
            }
        });
        $table.on(
            'check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table',
            function () {
                $remove.prop('disabled', !$table.bootstrapTable('getSelections').length)

                // save your data, here just save the current page
                selections = getIdSelections()
                // push or splice the selections if you want to save all data selections
            }
        )

        $table.on('all.bs.table', function (e, name, args) {
            //console.log(name, args)
        })
        $remove.click(function () {
            var ids = getIdSelections()
            $table.bootstrapTable('remove', {
                field: 'id',
                values: ids
            })
            $remove.prop('disabled', true)
        })
    }

    function changeFileCSV(e) {
        currentFileCSV = e
            .target
            .files
            .item(0);
        loadFileCSV(e);
    }

    function bootstrap_alert(type, message) {
        var typeAlert;
        switch (type) {
            case 'w':
                typeAlert = 'alert-warning';
                break;
            case 'e':
                typeAlert = 'alert-danger';
                break;
            default:
                typeAlert = 'alert-danger';
                break;
        }

        $('#alert_placeholder').html(
            '<div class="alert ' + typeAlert + ' alert-dismissible fade show" role="alert">' +
            '<strong>' + message + '<button type="button" class="btn-close" data-bs-dismiss' +
            '="alert" aria-label="Close"></button></div>'
        );
    }

    function loadFileCSV(e) {
        var ext = $("input#filename")
            .val()
            .split(".")
            .pop()
            .toLowerCase();

        if ($.inArray(ext, ["csv"]) == -1) {
            bootstrap_alert('e', 'Error file with no csv extension.');
            $("#filename").val('');
            return false;
        }

        $table.bootstrapTable('destroy');
        // Filter rules
        if ($.trim($("#filter").val()) != "") {
            colsToFilter = $("#filter")
                .val()
                .split(",");
            for (x = 0; x < colsToFilter.length; x++) {
                fieldExpr = colsToFilter[x].split(":");
                if ($.isNumeric(fieldExpr[0]) == false && fieldExpr[0] != '#') {
                    // Range Value
                    rangeValue = fieldExpr[0].split("-");
                    if (rangeValue.length != 2) {
                        bootstrap_alert(
                            'e',
                            'Error in Filter value ' + fieldExpr[0] + " is not numeric."
                        );
                        $("#filename").val('');
                        return;
                    } else {
                        if ($.isNumeric(rangeValue[0]) == false || $.isNumeric(rangeValue[0]) == false) {
                            bootstrap_alert('e', 'Error Range value ' + fieldExpr[0] + " is not numeric.");
                            $("#filename").val('');
                            return;
                        } else {
                            if (parseInt(rangeValue[0]) > parseInt(rangeValue[1])) {
                                bootstrap_alert(
                                    'e',
                                    'Error Range value from ' + rangeValue[0] +
                                            " is greater than Range value to " + rangeValue[1] + "."
                                );
                                $("#filename").val('');
                                return;
                            }

                            for (k = parseInt(rangeValue[0]); k <= parseInt(rangeValue[1]); k++) {
                                if (fieldExpr.length > 1) {
                                    mapCols.set(k, fieldExpr[1]);
                                } else {
                                    mapCols.set(k, "NoExpr");
                                }
                            }
                        }
                    }
                } else {
                    if (fieldExpr[0] != '#') {
                        if (fieldExpr.length > 1) {
                            mapCols.set(parseInt(fieldExpr[0]), fieldExpr[1]);
                        } else {
                            mapCols.set(parseInt(fieldExpr[0]), "NoExpr");
                        }
                    } else {
                        if (fieldExpr.length > 1) {
                            mapCols.set('#', fieldExpr[1]);
                        } else {
                            mapCols.set('#', "NoExpr");
                        }
                    }
                }
            }
        }

        // Reading CSV file
        var reader = new FileReader();
        var header = $('#isHeader').is(":checked");
        var headerFieldsI = [];
        var headerFieldsT = [];
        var headerFields = [];
        var headerNames = [];
        var dataFields = [];

        reader.onload = function (e) {
            var lines = e
                .target
                .result
                .split('\r\n');

            var lineNum = 0;
            var noHeader = false;
            var fields;

            headerFieldsT = [];
            headerFields = [];
            dataFields = [];
            headerNames = [];
            headerFieldsT.push(
                {field: 'state', checkbox: true, align: 'center', valign: 'middle', footerFormatter: totalTextFormatter}
            );
            headerFieldsT.push({
                title: 'Item ID',
                field: 'id',
                align: 'center',
                valign: 'middle',
                sortable: true,
                footerFormatter: totalNameFormatter
            });
            var rows = [];

            for (i = 0; i < lines.length; ++i) {
                // Check if present # (check regexpr on line)
                if (mapCols.size > 0 && (mapCols.has('#'))) {
                    if (mapCols.get('#') != 'NoExpr') {
                        var exprLine = RegExp(mapCols.get('#'));
                        if (exprLine.test(lines[i]) == false) 
                            continue;
                        }
                    }

                fields = lines[i].split(sep);
                var fieldNum = 1;
                // Header
                if (noHeader == false) {
                    if (header == true) {
                        fields = lines[0].split(sep);
                        lineNum = 1;
                        for (y = 0; y < fields.length; y++) {
                            if (mapCols.size > 0) {
                                // Caso con solo filtro
                                if ((mapCols.size == 1 && (mapCols.has('#') == false)) || mapCols.size > 1) {
                                    if ((mapCols.has(y + 1)) == false) 
                                        continue;
                                    }
                                }
                            if (mapCols.get(y + 1) == 'C') {
                                headerFieldsT.push(
                                    {field: fields[y], title: fields[y], footerFormatter: totalNumFormatter, sortable: true, align: 'center'}
                                );
                            } else {
                                headerFieldsT.push(
                                    {field: fields[y], title: fields[y], sortable: true, align: 'center'}
                                );
                            }
                            headerNames.push(fields[y]);
                        }
                    } else {
                        for (y = 0; y < fields.length; y++) {
                            if (mapCols.size > 0) {
                                // Caso con solo filtro
                                if ((mapCols.size == 1 && (mapCols.has('#') == false)) || mapCols.size > 1) {
                                    if ((mapCols.has(y + 1)) == false) 
                                        continue;
                                    }
                                }
                            if (mapCols.get(y + 1) == 'C') {
                                headerFieldsT.push({
                                    field: 'Field_' + fieldNum,
                                    title: 'Field ' + fieldNum,
                                    footerFormatter: totalNumFormatter,
                                    sortable: true,
                                    align: 'center'
                                });
                            } else {
                                headerFieldsT.push({
                                    field: 'Field_' + fieldNum,
                                    title: 'Field ' + fieldNum,
                                    sortable: true,
                                    align: 'center'
                                });
                            }
                            headerNames.push('Field_' + fieldNum);
                            fieldNum += 1;
                        }
                    }
                    headerFieldsT.push({
                        field: 'operate',
                        title: 'Item Operate',
                        align: 'center',
                        clickToSelect: false,
                        events: window.operateEvents,
                        formatter: operateFormatter
                    });

                    headerFields.push(headerFieldsT);
                    initTable(headerFields);
                    $table.bootstrapTable('showLoading');

                    noHeader = true;

                    if (header == true && i == 0) 
                        continue;
                    }
                
                // Body
                lineNum += 1;
                var data = {};
                data['id'] = lineNum;
                var colNum = 0;
                var discRow = false;
                fields = lines[i].split(sep);
                for (y = 0; y < fields.length; y++) {
                    if (mapCols.size > 0) {
                        // Caso con solo filtro
                        if ((mapCols.size == 1 && (mapCols.has('#') == false)) || mapCols.size > 1) {
                            if ((mapCols.has(y + 1) == false)) 
                                continue;
                            }
                        if (mapCols.get(y + 1) != 'NoExpr' && mapCols.get(y + 1) != 'C') {
                            var exprField = RegExp(mapCols.get(y + 1));
                            if (exprField.test(fields[y]) == false) {
                                discRow = true;
                                break;
                            }
                        }
                    }
                    data[headerNames[colNum]] = fields[y];
                    colNum += 1;
                }

                if (discRow == false && fields.length > 1) 
                    rows.push(data);
                }
            $table.bootstrapTable('load', rows);
            $table.bootstrapTable('hideLoading');
            $remove.removeAttr('hidden');
            $('#insert').removeAttr('hidden');
            mapCols.clear();
        };
        //reader.readAsText(e.target.files.item(0));
        reader.readAsText(currentFileCSV);
        return false;
    }

    var currentFileCSV;
    var $table = $('#table');
    var $remove = $('#remove');
    var selections = [];
    var sep = ';';
    var row = [];
    var mapCols = new Map();

    $("#separator").change(function () {
        sep = $("#separator").val();
    });

    $("#filename").change(changeFileCSV);

    // Close Modal
    $("#closeModal,.close").click(function () {
        $('#detailsModal').modal('hide');
    });

    // Save Modal
    $("#saveModal").click(function () {

        var data = {};
        var idxElem;
        var row;
        var bUpdate = false;
        if ($(".modal-title").text() == 'Row Detail') {
            bUpdate = true;
        }

        if (bUpdate) {
            idxElem = $('#ModalField_1').val();
            row = $table.bootstrapTable('getData')[idxElem];
        } else {
            idxElem = $('#ModalField_1').val();
            if (idxElem > $('#table').bootstrapTable('getOptions').totalRows + 1) {
                idxElem = $('#table')
                    .bootstrapTable('getOptions')
                    .totalRows;
            } else {
                idxElem = $('#ModalField_1').val() - 1;
            }
            row = $table.bootstrapTable('getData')[0];
        }

        var idxNewVal = 0;
        for (var key in row) {
            idxNewVal = idxNewVal + 1;
            if (key == 'state') 
                continue;
            if (key == 'id' && bUpdate) 
                continue;
            if (key == 'id') {
                data[key] = $('#table')
                    .bootstrapTable('getOptions')
                    .totalRows + 1;
            } else {
                data[key] = $('#ModalField_' + idxNewVal).val();
            }
        }
        if (bUpdate) {
            $table.bootstrapTable('updateRow', {
                index: idxElem,
                row: data
            });
        } else {
            $table.bootstrapTable('insertRow', {
                index: idxElem,
                row: data
            });
            $table.bootstrapTable('scrollTo', {
                unit: 'rows',
                value: idxElem
            });
        }

        $('#detailsModal').modal('hide');
    });

    // New Row
    $("#insert").click(function () {
        $(".modal-title").text('New Row');
        var formToShow = '<form>'
        var ind = 1;

        var row = $table.bootstrapTable('getData')[0];
        var newIdx = $('#table')
            .bootstrapTable('getOptions')
            .totalRows + 1;

        for (var key in row) {
            if (key == 'state') 
                continue;
            formToShow = formToShow + '<div class="form-group row">';
            formToShow = formToShow + '<label id="ModalHeader_' + ind + '" for="' + key + '" class="col-sm-2 col-form-label">' +
                    key + '</label><div class="col-sm-10">';
            if (key == 'id') {
                formToShow = formToShow + '<input type="number" class="form-control" min="1" ma' +
                        'x="1000000000" id="ModalField_' + ind + '" placeholder="' + key +
                        '" value="' + newIdx + '">';
            } else {
                formToShow = formToShow + '<input type="text" class="form-control" id="ModalFie' +
                        'ld_' + ind + '" placeholder="' + key + '">';
            }
            formToShow = formToShow + '</div></div>';
            ind += 1;
        }
        formToShow = formToShow + '<form>';

        $('#detailsModal')
            .modal('show')
            .find('.modal-body')
            .html(formToShow);
    });
});
