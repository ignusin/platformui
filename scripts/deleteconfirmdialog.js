(function (ns) {

    ns.DeleteConfirmDialog = function () {	      
        ns.DeleteConfirmDialog.super.constructor.call(this);
        
        this.setTitle('Удаление элемента');
        this.setText('Вы уверены, что хотите удалить выбранный элемент?');
        this.setContentSize(300, 65);
    };
    
    ns.inherit(ns.ConfirmDialog, ns.DeleteConfirmDialog, { });

} (PlatformUI));