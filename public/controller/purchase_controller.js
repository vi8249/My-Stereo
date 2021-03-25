let finalOrder = []

function loadDefaultOptions(data) {
    console.log(data)
    const defaultSupplier = data.supplier[0]

    for (let i = 0; i < data.supplier.length; ++i) {
        $('#newPurchaseModal .supplier').append(
            `<option value=${i}>${data.supplier[i].name}</option>`)
        $('#queryTab .supplier').append(
            `<option value=${i + 1}>${data.supplier[i].name}</option>`)
    }

    for (let i = 0; i < defaultSupplier.items.length; ++i) {
        $('#newPurchaseModal .supplierItemID').append(
            `<option value=${i}>${defaultSupplier.items[i].item_id}</option>`)
        $('#newPurchaseModal .supplierItem').append(
            `<option value=${i}>${defaultSupplier.items[i].item_name}</option>`)
    }

    $("#newPurchaseModal .itemPrice").val(`${data.supplier[0].items[0].price}`)
}

function appendDataOnOptionChange(data, option) {
    let found = data.supplier.find(function (ele) {
        return ele.name === $(`#newPurchaseModal .${option[0]}`).find(
            ":selected").text()
    })

    for (let i = 1; i < option.length; ++i)
        $(`#newPurchaseModal .${option[i]} option`).remove();

    for (let j = 1; j < option.length; ++j) {
        for (let i = 0; i < found.items.length; ++i) {
            if (option[j] === 'supplierItemID') {
                $(`#newPurchaseModal .${option[j]}`).append(
                    `<option value=${i}>${found.items[i].item_id}</option>`)
            } else {
                $(`#newPurchaseModal .${option[j]}`).append(
                    `<option value=${i}>${found.items[i].item_name}</option>`)
            }
        }
    }

    $("#newPurchaseModal .itemPrice").val(`${found.items[0].price}`)
    $('#newPurchaseModal .itemQuan').val('')
    $('#newPurchaseModal .totalPrice').val('')
}

// option = [supplier, supplierItem, supplierItemID]
function selectDataOnOptionChange(data, option) {
    $(`#newPurchaseModal .${option[1]}`).val($(`#newPurchaseModal .${option[2]}`).val())
    const price = data.supplier[$('#newPurchaseModal .supplier').val()]
        .items[$(`#newPurchaseModal .${option[1]}`).val()].price
    $('#newPurchaseModal .itemPrice').val(price)
    $('#newPurchaseModal .itemQuan').val('')
    $('#newPurchaseModal .totalPrice').val('')
}

function appendDataToTable(data) {
    const tableBody = $("#newPurchaseModal .myTable")
    if (finalOrder.length === 0)
        tableBody.find("tr").remove();

    if (finalOrder.find(ele => ele.supplierItemID === data.supplierItemID))
        alert('品項已在訂單中')
    else {
        finalOrder.push(data)
        tableBody.append(`
                    <tr>
                        <td> <button type='button'class='btn btn-danger' name='remove'> - </button></td>
                        <td> ${data.supplierItemID}</td>
                        <td> ${data.supplierItem} </td>
                        <td> ${data.itemPrice} </td>
                        <td> ${data.itemQuan} </td>
                        <td> ${data.totalPrice} </td>
                    </tr>`)
    }
    // <td> <input type='checkbox' name='record'> </td>
}

function removeAllOrders() {
    finalOrder = []
    $("#newPurchaseModal .myTable tr").remove();
    $("#newPurchaseModal .myTable").append(`<tr>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                </tr>`)
}

jQuery(function () {
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });

    // load data before 
    $.get("/supplier", function (data) {
        loadDefaultOptions(data)
        addMoreDataEvent()
    }).fail(function (err) {
        alert('load page failed!')
    })


    // $('#newPurchaseModal').on('shown.bs.modal', function () {
    //     console.log('開啟視窗前呼叫');
    //     $.get("/supplier", function (data) {
    //         loadDefaultOptions(data)
    //     }).fail(function (err) {
    //         alert('load page failed!')
    //     })
    // })

    $("#newPurchaseModal").on("hide.bs.modal", function (e) {
        console.log('關閉視窗前呼叫');
    });

    $('.newPurchase').on('click', function (e) {
        // e.preventDefault()
        if (finalOrder.length) {
            $.post('/purchase', {
                    finalOrder: finalOrder,
                    orderTo: $('#newPurchaseModal .supplier').find(":selected")
                        .text(),
                    date: new Date().toJSON().slice(0, 10),
                    payMethod: $('#newPurchaseModal .payMethod').find(":selected")
                        .text()
                }, function (data) {
                    removeAllOrders()
                    // $(".modal-footer .cancel").click()

                })
                .fail(function (err) {
                    alert("提交失敗");
                }).always(function () {
                    alert("提交成功");
                    $('#newPurchaseModal').modal('toggle')
                    window.location.reload(true)
                })
        } else {
            alert("無訂購項目");
        }
    })

    $('#newPurchaseModal .supplier').on('change', function (e) {
        $.get("/supplier", function (data) {
            appendDataOnOptionChange(data, [
                'supplier',
                'supplierItem',
                'supplierItemID',
                'itemPrice',
            ])
            removeAllOrders()
        })
    })

    $('#newPurchaseModal .supplierItemID').on('change', function (e) {
        $.get("/supplier", function (data) {
            selectDataOnOptionChange(data, [
                'supplier',
                'supplierItem',
                'supplierItemID',
            ])
        })
    })

    $('#newPurchaseModal .supplierItem').on('change', function (e) {
        $.get("/supplier", function (data) {
            selectDataOnOptionChange(data, [
                'supplier',
                'supplierItemID',
                'supplierItem'
            ])
        })
    })

    $('#newPurchaseModal .itemQuan').on('change', function (e) {
        const totalPrice = $('#newPurchaseModal .itemPrice').val() * $(
            '#newPurchaseModal .itemQuan').val()
        $('#newPurchaseModal .totalPrice').val(totalPrice)

    })

    $('#newPurchaseModal .itemQuan').on('keyup', function (e) {
        if ($('#newPurchaseModal .itemQuan').val() < 0) {
            alert('訂購數量必須大於0')
            $('#newPurchaseModal .itemQuan').val('')
        } else {
            const totalPrice = $('#newPurchaseModal .itemPrice').val() * $(
                '#newPurchaseModal .itemQuan').val()
            $('#newPurchaseModal .totalPrice').val(totalPrice)
        }
    })

    $('#newPurchaseModal .addOrder').click(function () {
        if ($('#newPurchaseModal .itemQuan').val() <= 0) {
            alert('訂購數量必須大於0')
            $('#newPurchaseModal .itemQuan').val('')
        } else if (!$('#newPurchaseModal .itemQuan').val()) {
            alert('請輸入欲訂購數量')
        } else {
            appendDataToTable({
                supplierItemID: $("#newPurchaseModal .supplierItemID").find(
                    ":selected").text(),
                supplierItem: $("#newPurchaseModal .supplierItem").find(
                        ":selected")
                    .text(),
                itemPrice: $('#newPurchaseModal .itemPrice').val(),
                itemQuan: $('#newPurchaseModal .itemQuan').val(),
                totalPrice: $('#newPurchaseModal .totalPrice').val()
            })
            $('#newPurchaseModal .itemQuan').val('')
            $('#newPurchaseModal .totalPrice').val('')

            $("#newPurchaseModal .myTable").find('button[name="remove"]').each(
                function () {
                    $(this).click(function () {
                        let currentId = $(this).parents("tr").children(
                                'td')[1]
                            .innerText
                        finalOrder = finalOrder.filter(ele => ele
                            .supplierItemID != currentId)
                        $(this).parents("tr").remove();
                    })
                })
        }
    })

    $('#modal-footer .cancel').on('click', function (e) {
        removeAllOrders()
    })


    $("#purchaseModal").on("hide.bs.modal", function (e) {
        // console.log('關閉視窗前呼叫');

        $('#purchaseModal .tbody_').find('tr').remove()
    });

    function addMoreDataEvent() {
        $(".tbodyForpurchase").find('button[name="more"]').each(
            function () {
                $(this).click(function () {
                    let id = $(this).siblings('input').val()
                    $('#purchaseModal .purchaseId').val(id)

                    $.get(`/purchase/${id}`, function (data) {
                        $('#purchaseModal #ModalLabel').text(
                            `採購單#${data.orderId}`)
                        $('#purchaseModal .supplier').val(data.orderTo)
                        $('#purchaseModal .tbody_').find("tr").remove()

                        for (let i = 0; i < data.orderItem.length; ++i) {
                            $('#purchaseModal .tbody_').append(
                                `<tr>
                                            <td>${data.orderItem[i].item_id}</td>
                                            <td>${data.orderItem[i].item_name}</td>
                                            <td>${data.orderItem[i].price}</td>
                                            <td>${data.orderInfo[i].itemQuan}</td>
                                            <td>${data.orderInfo[i].totalPrice}</td>
                                        </tr>`
                            )
                        }

                        $("#purchaseModal .status").children().each(
                            function () {
                                if ($(this).text() === data.status) {
                                    $(this).attr("selected", "true")
                                }
                            })

                        $("#purchaseModal .payMethod").children().each(
                            function () {
                                if ($(this).text() === data.payment) {
                                    $(this).attr("selected", "true")
                                }
                            })

                        $('#purchaseModal').modal('toggle')
                    })
                })
            })
    }



    $("#purchaseModal .modiflyPurchase").click(function () {

        let id = $('#purchaseModal .purchaseId').val()

        let patchData = {
            status: $('#purchaseModal .status').find(
                ":selected").text(),
            payment: $('#purchaseModal .payMethod').find(
                ":selected").text()
        }

        axios.patch(`/purchase/${id}`, patchData)
            .then(res => {
                console.log(res);
                $('#purchaseModal').modal('toggle')
                window.location.reload(true)
            })
            .catch(error => {
                console.log(error.response);
            });
    })

    $("#purchaseModal .deletePurchase").click(function () {
        let id = $('#purchaseModal .purchaseId').val()

        axios.delete(`/purchase/${id}`)
            .then(res => {
                console.log(res);
                $('#purchaseModal').modal('toggle')
                window.location.reload(true)
            })
            .catch(error => {
                console.log(error.response);
            });
    })

    function appendQueryReult(data) {
        const tableBody = $('#queryTab .tbodyForpurchase')
        tableBody.append(`<tr>
                                            <td> ${data.orderId}</td>
                                            <td> ${data.orderTo} </td>
                                            <td> ${data.payment} </td>
                                            <td> ${data.date} </td>
                                            <td> ${data.status} </td>
                                            <td>
                                                <input type="text" name="purchaseId" value=${data._id}
                                                    hidden>
                                                <button type="click" class="btn btn-outline-dark" name="more">點我</button>
                                            </td>
                                        </tr>`)
    }

    $("#queryTab .queryButton").click(function () {
        $('#queryTab .queryResult').attr('hidden', 'true')
        $('#queryTab .tbodyForpurchase').find("tr").remove();

        let option = {}
        if ($('#queryTab .orderId').val())
            option.orderId = $('#queryTab .orderId').val()
        if ($('#queryTab .date').val())
            option.date = $('#queryTab .date').val()
        if ($('#queryTab .supplier').find(':selected').val() != 0)
            option.orderTo = $('#queryTab .supplier').find(':selected').text()
        if ($('#queryTab .payment').find(':selected').val() != 0)
            option.payment = $('#queryTab .payment').find(':selected').text()
        if ($('#queryTab .status').find(':selected').val() != 0)
            option.status = $('#queryTab .status').find(':selected').text()
        // console.log(option)

        if (Object.keys(option).length === 0) {
            let yes = confirm('是否要搜尋所有採購單')
            if (!yes) {
                $('#queryTab .queryResult').attr('hidden', 'true');
                return
            }
        }

        $.get('/purchase', {
                search: 1,
                option
            }, function (data) {
                // console.log(data)
                if (data.length === 0) {
                    alert('查無採購單')
                } else {
                    for (let i = 0; i < data.length; ++i) {
                        console.log(data[i]);
                        appendQueryReult(data[i])
                    }
                    addMoreDataEvent()
                    $('#queryTab .totalCount').text(`共${data.length}筆`)
                    if ($('#queryTab .queryResult').attr('hidden'))
                        $('#queryTab .queryResult').removeAttr('hidden');
                }
            })
            .fail(error => {
                console.log(error.response);
            });
    })
})