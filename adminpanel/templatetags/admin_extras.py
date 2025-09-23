from django import template

register = template.Library()

@register.filter
def attr(obj, name):
    try:
        return getattr(obj, name)
    except Exception:
        return None
