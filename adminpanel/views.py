from django.apps import apps
from django.contrib import messages
from django.contrib.admin.utils import quote
from django.contrib.auth.decorators import user_passes_test
from django.contrib.contenttypes.models import ContentType
from django.core.paginator import Paginator
from django.forms import modelform_factory
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse


def staff_required(view_func):
    return user_passes_test(lambda u: u.is_active and u.is_staff)(view_func)


@staff_required
def admin_dashboard(request):
    # Basic stats for dashboard
    stats = {}
    try:
        user_model = apps.get_model('users', 'CustomUser') if apps.is_installed('users') else None
        if user_model:
            stats['users_count'] = user_model.objects.count()
    except Exception:
        stats['users_count'] = None

    try:
        feed_post = apps.get_model('feeds', 'Post') if apps.is_installed('feeds') else None
        if feed_post:
            stats['posts_count'] = feed_post.objects.count()
    except Exception:
        stats['posts_count'] = None

    context = {
        'page_title': 'Admin Dashboard',
        'stats': stats,
    }
    return render(request, 'adminpanel/admin_dashboard.html', context)


def _get_all_models_grouped():
    grouped = {}
    for app_config in apps.get_app_configs():
        # Skip Django contrib admin itself
        if app_config.name.startswith('django.'):
            continue
        models = app_config.get_models()
        model_items = []
        for m in models:
            # Hide proxy/abstract models and ContentType itself
            if getattr(m._meta, 'proxy', False) or getattr(m._meta, 'abstract', False):
                continue
            if m is ContentType:
                continue
            model_items.append({
                'app_label': m._meta.app_label,
                'model_name': m._meta.model_name,
                'object_name': m._meta.object_name,
                'verbose_name': m._meta.verbose_name,
                'verbose_name_plural': m._meta.verbose_name_plural,
            })
        if model_items:
            grouped[app_config.label] = {
                'app_label': app_config.label,
                'app_verbose_name': getattr(app_config, 'verbose_name', app_config.label.title()),
                'models': sorted(model_items, key=lambda x: x['verbose_name_plural'])
            }
    return dict(sorted(grouped.items(), key=lambda x: x[0]))


@staff_required
def models_index(request):
    grouped = _get_all_models_grouped()
    return render(request, 'adminpanel/models_index.html', {
        'page_title': 'Data Models',
        'grouped': grouped,
    })


def _resolve_model_or_404(app_label: str, model_name: str):
    try:
        model = apps.get_model(app_label, model_name)
    except LookupError:
        raise Http404('Model not found')
    if model is None:
        raise Http404('Model not found')
    return model


@staff_required
def object_list(request, app_label: str, model_name: str):
    model = _resolve_model_or_404(app_label, model_name)

    # Basic search across char/text fields
    qs = model.objects.all()
    search = request.GET.get('q', '').strip()
    if search:
        from django.db.models import Q
        q = Q()
        for f in model._meta.get_fields():
            try:
                if getattr(f, 'attname', None) and getattr(f, 'get_internal_type', lambda: None)() in ('CharField', 'TextField'):
                    q |= Q(**{f.attname + '__icontains': search})
            except Exception:
                continue
        if q:
            qs = qs.filter(q)

    # Order by -pk by default
    try:
        qs = qs.order_by('-pk')
    except Exception:
        pass

    paginator = Paginator(qs, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    fields = [f for f in model._meta.fields]

    context = {
        'page_title': f"{model._meta.verbose_name_plural.title()}",
        'model': model,
        'fields': fields,
        'page_obj': page_obj,
        'search': search,
        'app_label': app_label,
        'model_name': model_name,
    }
    return render(request, 'adminpanel/object_list.html', context)


def _build_modelform(model):
    # Exclude many-to-many and auto fields by default
    exclude = []
    for f in model._meta.get_fields():
        if getattr(f, 'auto_created', False) and not getattr(f, 'concrete', True):
            exclude.append(f.name)
        if getattr(f, 'auto_now', False) or getattr(f, 'auto_now_add', False):
            exclude.append(f.name)
        if getattr(f, 'primary_key', False) and getattr(f, 'auto_created', False):
            exclude.append(f.name)
    try:
        form_class = modelform_factory(model, exclude=exclude)
    except Exception:
        form_class = modelform_factory(model, fields='__all__')
    return form_class


@staff_required
def object_add(request, app_label: str, model_name: str):
    model = _resolve_model_or_404(app_label, model_name)
    Form = _build_modelform(model)
    if request.method == 'POST':
        form = Form(request.POST, request.FILES)
        if form.is_valid():
            obj = form.save()
            messages.success(request, f"Created {model._meta.verbose_name} #{obj.pk}.")
            return redirect('adminpanel:object_list', app_label=app_label, model_name=model_name)
    else:
        form = Form()
    return render(request, 'adminpanel/object_form.html', {
        'page_title': f"Add {model._meta.verbose_name.title()}",
        'form': form,
        'model': model,
        'is_add': True,
    })


@staff_required
def object_edit(request, app_label: str, model_name: str, pk: int):
    model = _resolve_model_or_404(app_label, model_name)
    obj = get_object_or_404(model, pk=pk)
    Form = _build_modelform(model)
    if request.method == 'POST':
        form = Form(request.POST, request.FILES, instance=obj)
        if form.is_valid():
            form.save()
            messages.success(request, f"Updated {model._meta.verbose_name} #{obj.pk}.")
            return redirect('adminpanel:object_list', app_label=app_label, model_name=model_name)
    else:
        form = Form(instance=obj)
    return render(request, 'adminpanel/object_form.html', {
        'page_title': f"Edit {model._meta.verbose_name.title()} #{obj.pk}",
        'form': form,
        'model': model,
        'object': obj,
        'is_add': False,
    })


@staff_required
def object_delete(request, app_label: str, model_name: str, pk: int):
    model = _resolve_model_or_404(app_label, model_name)
    obj = get_object_or_404(model, pk=pk)
    if request.method == 'POST':
        obj_display = str(obj)
        obj.delete()
        messages.success(request, f"Deleted {model._meta.verbose_name} '{obj_display}'.")
        return redirect('adminpanel:object_list', app_label=app_label, model_name=model_name)
    return render(request, 'adminpanel/confirm_delete.html', {
        'page_title': f"Delete {model._meta.verbose_name.title()} #{obj.pk}",
        'model': model,
        'object': obj,
    })
